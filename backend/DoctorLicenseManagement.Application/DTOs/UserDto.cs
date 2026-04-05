using System.ComponentModel.DataAnnotations;

public class UserDto
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    
    public string Role { get; set; } = "User";
}