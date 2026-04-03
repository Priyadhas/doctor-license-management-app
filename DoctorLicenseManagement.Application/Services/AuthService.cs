using DoctorLicenseManagement.Application.Interfaces;
using Dapper;
using System.Data;

namespace DoctorLicenseManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IDbConnectionFactory _factory;
    private readonly IJwtService _jwtService;

    public AuthService(IDbConnectionFactory factory, IJwtService jwtService)
    {
        _factory = factory;
        _jwtService = jwtService;
    }

    public async Task<string> LoginAsync(string email, string password)
    {
        using var connection = _factory.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT * FROM Users WHERE Email = @Email",
            new { Email = email });

        if (user == null || user.Password != password)
            throw new Exception("Invalid credentials");

        return _jwtService.GenerateToken(email);
    }
}