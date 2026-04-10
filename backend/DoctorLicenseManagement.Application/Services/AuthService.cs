using Dapper;
using System.Data;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Text;

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

        // Admin Password
        // Console.WriteLine(HashPassword("Admin@963"));

        if (user == null)
            throw new Exception("User not found");

        var isValid = VerifyPassword(dto.Password, (string)user.Password);

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

        var hashedPassword = HashPassword(dto.Password);

        await connection.ExecuteAsync(@"
            INSERT INTO Users (Email, Password, Role)
            VALUES (@Email, @Password, @Role)",
            new
            {
                Email = dto.Email,
                Password = hashedPassword,
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
    "DocCare | Reset Your Password",
    $@"
    <div style='background-color:#f4f6f8;padding:40px 0;font-family:Arial,sans-serif;'>

        <table align='center' width='100%' cellpadding='0' cellspacing='0' style='max-width:600px;background:#ffffff;border-radius:10px;padding:30px;'>

            <tr>
                <td align='center'>
                    <h2 style='margin:0;color:#1e3a8a;font-weight:600;'>
                        Welcome to DocCare
                    </h2>
                </td>
            </tr>

            <tr>
                <td style='padding-top:20px;text-align:center;color:#374151;font-size:14px;line-height:1.6;'>
                    We received a request to reset your password for your DocCare account.
                </td>
            </tr>

            <tr>
                <td style='padding-top:10px;text-align:center;color:#374151;font-size:14px;line-height:1.6;'>
                    Manage your doctor licenses securely and efficiently through our platform.
                </td>
            </tr>

            <tr>
                <td align='center' style='padding:30px 0;'>
                    <a href='{link}' 
                       style='display:inline-block;background-color:#2563eb;color:#ffffff;
                              padding:12px 28px;border-radius:6px;text-decoration:none;
                              font-size:14px;font-weight:600;'>
                        Reset Your Password
                    </a>
                </td>
            </tr>

            <tr>
                <td style='text-align:center;color:#6b7280;font-size:13px;line-height:1.5;'>
                    This link will expire in <strong>15 minutes</strong> for security reasons.
                </td>
            </tr>

            <tr>
                <td style='padding-top:10px;text-align:center;color:#6b7280;font-size:13px;line-height:1.5;'>
                    If you did not request this, you can safely ignore this email.
                </td>
            </tr>

            <tr>
                <td style='padding-top:25px;text-align:center;font-size:12px;color:#9ca3af;'>
                    © 2026 DocCare — Doctor License Management System
                </td>
            </tr>

        </table>

    </div>
    ");
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

        var hashedPassword = HashPassword(dto.NewPassword);

        await connection.ExecuteAsync(@"
            UPDATE Users
            SET Password = @Password,
                ResetToken = NULL,
                ResetTokenExpiry = NULL
            WHERE Email = @Email",
            new { Password = hashedPassword, Email = dto.Email });
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
    // PASSWORD HASHING
    // ============================
    private string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);

        string hash = Convert.ToBase64String(
            KeyDerivation.Pbkdf2(
                password,
                salt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                32));

        return $"{Convert.ToBase64String(salt)}.{hash}";
    }

    private bool VerifyPassword(string enteredPassword, string storedPassword)
    {
        var parts = storedPassword.Split('.');
        if (parts.Length != 2) return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        string storedHash = parts[1];

        string enteredHash = Convert.ToBase64String(
            KeyDerivation.Pbkdf2(
                enteredPassword,
                salt,
                KeyDerivationPrf.HMACSHA256,
                10000,
                32));

        return enteredHash == storedHash;
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