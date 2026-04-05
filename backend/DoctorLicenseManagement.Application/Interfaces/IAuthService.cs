using DoctorLicenseManagement.Application.DTOs;

public interface IAuthService
{
    Task<object> LoginAsync(LoginDto dto);

    Task ForgotPasswordAsync(string email);

    Task ResetPasswordAsync(ResetPasswordDto dto);

    Task RegisterAsync(RegisterDto dto);
}