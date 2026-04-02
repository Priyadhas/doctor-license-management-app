using Microsoft.Data.SqlClient;
using System.Text.RegularExpressions;

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
        Console.WriteLine(" Starting database initialization...");

        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var sqlFilePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Database",
            "setup.sql"
        );

        if (!File.Exists(sqlFilePath))
        {
            Console.WriteLine(" setup.sql file not found");
            return;
        }

        var script = await File.ReadAllTextAsync(sqlFilePath);

        // Split script by GO statements (IMPORTANT)
        var commands = Regex.Split(script, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase);

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
                Console.WriteLine(" Error executing SQL:");
                Console.WriteLine(trimmedCommand);
                Console.WriteLine(ex.Message);
            }
        }

        Console.WriteLine(" Database initialization completed successfully!");
    }
}