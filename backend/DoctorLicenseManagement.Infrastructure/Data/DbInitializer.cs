using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using System.Reflection;

namespace DoctorLicenseManagement.Infrastructure.Data;

public class DatabaseInitializer
{
    private readonly IConfiguration _configuration;

    public DatabaseInitializer(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task InitializeAsync()
    {
        Console.WriteLine(" Starting database initialization...");

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new Exception(" Connection string is missing");

        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;

        // ============================
        // CREATE DATABASE IF NOT EXISTS
        // ============================

        builder.InitialCatalog = "master";

        using (var masterConnection = new SqlConnection(builder.ConnectionString))
        {
            await masterConnection.OpenAsync();

            var createDbQuery = $@"
                IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '{databaseName}')
                BEGIN
                    CREATE DATABASE [{databaseName}];
                END";

            await masterConnection.ExecuteAsync(createDbQuery);

            Console.WriteLine($" Database '{databaseName}' ready");
        }

        // ============================
        // CONNECT TO ACTUAL DATABASE
        // ============================

        builder.InitialCatalog = databaseName;

        using var connection = new SqlConnection(builder.ConnectionString);
        await connection.OpenAsync();

        // ============================
        // CREATE ACTIVITY LOGS TABLE (SAFE)
        // ============================

        var activityTableQuery = @"
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
            BEGIN
                CREATE TABLE ActivityLogs (
                    Id INT PRIMARY KEY IDENTITY(1,1),
                    Message NVARCHAR(255) NOT NULL,
                    Type NVARCHAR(50) NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                )
            END
        ";

        await connection.ExecuteAsync(activityTableQuery);

        Console.WriteLine(" ActivityLogs table ready");

        // ============================
        // RUN setup.sql (EMBEDDED)
        // ============================

        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = "DoctorLicenseManagement.Infrastructure.Data.Scripts.setup.sql";

        Console.WriteLine($" Loading SQL script: {resourceName}");

        using var stream = assembly.GetManifestResourceStream(resourceName);

        if (stream == null)
            throw new Exception($" Embedded SQL not found: {resourceName}");

        using var reader = new StreamReader(stream);
        var script = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(script))
            throw new Exception(" setup.sql is empty");

        // ============================
        // EXECUTE SCRIPT SAFELY
        // ============================

        var commands = script
            .Split("GO", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var command in commands)
        {
            if (string.IsNullOrWhiteSpace(command))
                continue;

            try
            {
                await connection.ExecuteAsync(command);
            }
            catch (Exception ex)
            {
                Console.WriteLine(" SQL execution warning:");
                Console.WriteLine(ex.Message);
            }
        }

        Console.WriteLine(" Database initialization completed successfully!");
    }
}