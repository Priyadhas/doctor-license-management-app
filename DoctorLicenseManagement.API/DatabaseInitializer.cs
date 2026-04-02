using Microsoft.Data.SqlClient;
using System.Text.RegularExpressions;
using Dapper;

namespace DoctorLicenseManagement.API.Database;

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
        {
            Console.WriteLine("Connection string is missing");
            return;
        }

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
        // RUN setup.sql ON DoctorDB
        // ============================

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var sqlFilePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Database",
            "setup.sql"
        );

        if (!File.Exists(sqlFilePath))
        {
            Console.WriteLine("setup.sql file not found");
            return;
        }

        var script = await File.ReadAllTextAsync(sqlFilePath);

        // Split script by GO
        var commands = Regex.Split(
            script,
            @"^\s*GO\s*$",
            RegexOptions.Multiline | RegexOptions.IgnoreCase
        );

        foreach (var commandText in commands)
        {
            var trimmedCommand = commandText.Trim();

            if (string.IsNullOrWhiteSpace(trimmedCommand))
                continue;

            using var command = new SqlCommand(trimmedCommand, connection);

            try
            {
                await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error executing SQL block:");
                Console.WriteLine(trimmedCommand);
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        Console.WriteLine("Database initialization completed successfully!");
    }
}