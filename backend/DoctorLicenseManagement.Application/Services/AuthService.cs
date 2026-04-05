using Dapper;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;

public class AuthService : IAuthService
{
    private readonly IDbConnectionFactory _factory;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthService(
        IDbConnectionFactory factory,
        IConfiguration config,
        IEmailService emailService)
    {
        _factory = factory;
        _config = config;
        _emailService = emailService;
    }

    // ============================
    // LOGIN
    // ============================
public async Task<object> LoginAsync(LoginDto dto)
{
    using var connection = _factory.CreateConnection();

    var user = await connection.QueryFirstOrDefaultAsync<dynamic>(
        "SELECT * FROM Users WHERE Email = @Email",
        new { dto.Email });

    if (user == null)
        throw new Exception("User not found");
        
  var isValid = dto.Password == (string)user.Password;

    if (!isValid)
        throw new Exception("Invalid credentials");

    var token = GenerateJwt(user.Email, user.Role);

    return new
    {
        token,
        user = new
        {
            email = user.Email,
            role = user.Role
        }
    };
}
    // ============================
    // REGISTER
    // ============================
    public async Task RegisterAsync(RegisterDto dto)
    {
        using var connection = _factory.CreateConnection();

        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new Exception("Email and password are required");

        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Users WHERE Email = @Email",
            new { Email = dto.Email });

        if (exists > 0)
            throw new Exception("User already exists");

        var adminExists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Users WHERE Role = 'Admin'");

        var role = adminExists == 0 ? "Admin" : "User";

        await connection.ExecuteAsync(@"
            INSERT INTO Users (Email, Password, Role)
            VALUES (@Email, @Password, @Role)",
            new
            {
                Email = dto.Email,
                Password = dto.Password,
                Role = role
            });
    }

    // ============================
    // FORGOT PASSWORD
    // ============================
    public async Task ForgotPasswordAsync(string email)
    {
        using var connection = _factory.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<UserDto>(
            "SELECT Email FROM Users WHERE Email = @Email",
            new { Email = email });

        if (user == null) return;

        var token = Guid.NewGuid().ToString();

        await connection.ExecuteAsync(@"
            UPDATE Users
            SET ResetToken = @Token,
                ResetTokenExpiry = DATEADD(MINUTE, 15, GETDATE())
            WHERE Email = @Email",
            new { Token = token, Email = email });

        var link = $"http://localhost:3000/reset-password?token={token}&email={email}";

        await _emailService.SendEmailAsync(
            email,
            "Reset Password",
            $"Click here: <a href='{link}'>Reset Password</a>");
    }

    // ============================
    // RESET PASSWORD
    // ============================
    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        using var connection = _factory.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<UserDto>(@"
            SELECT Email FROM Users 
            WHERE Email = @Email 
            AND ResetToken = @Token 
            AND ResetTokenExpiry > GETDATE()",
            new { Email = dto.Email, Token = dto.Token });

        if (user == null)
            throw new Exception("Invalid or expired token");

        await connection.ExecuteAsync(@"
            UPDATE Users
            SET Password = @Password,
                ResetToken = NULL,
                ResetTokenExpiry = NULL
            WHERE Email = @Email",
            new { Password = dto.NewPassword , Email = dto.Email });
    }

    // ============================
    // REFRESH TOKEN
    // ============================
    public async Task<object> RefreshTokenAsync(string email, string refreshToken)
    {
        using var connection = _factory.CreateConnection();

        var user = await connection.QueryFirstOrDefaultAsync<UserDto>(@"
            SELECT Email, Role FROM Users
            WHERE Email = @Email
            AND RefreshToken = @RefreshToken
            AND RefreshTokenExpiry > GETDATE()",
            new { Email = email, RefreshToken = refreshToken });

        if (user == null)
            throw new Exception("Invalid refresh token");

        var newAccessToken = GenerateJwt(user.Email, user.Role);

        return new { token = newAccessToken };
    }

    // ============================
    // JWT GENERATION
    // ============================
    private string GenerateJwt(string email, string role)
    {
        var keyValue = _config["Jwt:Key"];

        if (string.IsNullOrEmpty(keyValue))
            throw new Exception("JWT Key missing");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            expires: DateTime.UtcNow.AddHours(2),
            claims: claims,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ============================
    // REFRESH TOKEN GENERATOR
    // ============================
    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}