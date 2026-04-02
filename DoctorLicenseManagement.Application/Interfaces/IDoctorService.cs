using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Domain.Entities;

namespace DoctorLicenseManagement.Application.Interfaces;

public interface IDoctorService
{
    Task<IEnumerable<Doctor>> GetAllAsync(string? search, string? status);

    Task<Doctor?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateDoctorDto dto);

    Task UpdateAsync(int id, CreateDoctorDto dto);

    Task DeleteAsync(int id);
}