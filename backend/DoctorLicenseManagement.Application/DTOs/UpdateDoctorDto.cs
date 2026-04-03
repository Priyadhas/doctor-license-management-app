namespace DoctorLicenseManagement.Application.DTOs;

public class UpdateDoctorDto
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public DateTime? LicenseExpiryDate { get; set; }
    
    public string Status { get; set; } = string.Empty;
}