using System.ComponentModel.DataAnnotations;

public class CreateDoctorDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    [Required]
    public string LicenseNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "License Expiry Date is required")]
    [DataType(DataType.Date)]
    public DateTime? LicenseExpiryDate { get; set; }

    [Required]
    public string Status { get; set; } = "Active";
}