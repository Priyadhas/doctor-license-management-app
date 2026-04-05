using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // ============================
    // LOGIN
    // ============================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    // ============================
    // FORGOT PASSWORD
    // ============================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto.Email);
        return Ok(new { message = "Reset link sent" });
    }

    // ============================
    // RESET PASSWORD
    // ============================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto);
        return Ok(new { message = "Password updated successfully" });
    }

    // ============================
    // REGISTER USER
    // ============================
    [HttpPost("register")]
public async Task<IActionResult> Register(RegisterDto dto)
{
    await _authService.RegisterAsync(dto);
    return Ok(new { message = "User registered successfully" });
}
}