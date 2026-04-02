using DoctorLicenseManagement.Application.DTOs;

namespace DoctorLicenseManagement.Application.Interfaces;

public interface IDoctorService
{
    Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync(string? search, string? status);
    Task<DoctorDto?> GetDoctorByIdAsync(int id);
    Task<int> AddDoctorAsync(CreateDoctorDto dto);
    Task<bool> UpdateDoctorAsync(int id, CreateDoctorDto dto);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<bool> DeleteDoctorAsync(int id);
}
