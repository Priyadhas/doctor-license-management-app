using DoctorLicenseManagement.Application.DTOs;

namespace DoctorLicenseManagement.Application.Interfaces;

public interface IDoctorService
{
    Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync();
    Task<int> AddDoctorAsync(CreateDoctorDto dto);
}