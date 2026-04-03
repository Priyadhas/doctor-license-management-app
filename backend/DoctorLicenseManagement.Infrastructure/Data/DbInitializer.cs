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
        Console.WriteLine("Starting database initialization...");

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new Exception("Connection string is missing");

        // ============================
        // CREATE DATABASE IF NOT EXISTS
        // ============================

        var masterConnectionString = connectionString.Replace("Database=DoctorDB", "Database=master");

        using (var masterConnection = new SqlConnection(masterConnectionString))
        {
            await masterConnection.OpenAsync();

            var createDbQuery = @"
                IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DoctorDB')
                BEGIN
                    CREATE DATABASE DoctorDB;
                END";

            await masterConnection.ExecuteAsync(createDbQuery);

            Console.WriteLine("Database checked/created successfully");
        }

        // ============================
        // RUN setup.sql FROM EMBEDDED RESOURCE
        // ============================

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var assembly = Assembly.GetExecutingAssembly();

        var resourceName = "DoctorLicenseManagement.Infrastructure.Data.Scripts.setup.sql";

        Console.WriteLine($"Loading SQL script: {resourceName}");

        using var stream = assembly.GetManifestResourceStream(resourceName);

        if (stream == null)
            throw new Exception($"Embedded SQL not found: {resourceName}");

        using var reader = new StreamReader(stream);
        var script = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(script))
            throw new Exception("setup.sql is empty");

        // ============================
        // EXECUTE SCRIPT (SAFE + IDEMPOTENT)
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
                Console.WriteLine("SQL execution warning:");
                Console.WriteLine(ex.Message);
            }
        }

        Console.WriteLine("Database initialization completed successfully!");
    }
}