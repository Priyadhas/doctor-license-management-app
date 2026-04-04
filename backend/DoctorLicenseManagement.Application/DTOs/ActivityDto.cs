namespace DoctorLicenseManagement.Application.DTOs
{
    public class ActivityDto
    {
        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}