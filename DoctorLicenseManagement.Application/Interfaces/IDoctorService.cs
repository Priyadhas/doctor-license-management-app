using DoctorLicenseManagement.Application.DTOs;

namespace DoctorLicenseManagement.Application.Interfaces;


// Service contract for managing doctor licenses
public interface IDoctorService
{
    // Get all doctors with optional search and status filter
    Task<IReadOnlyList<DoctorDto>> GetAllDoctorsAsync(
    string? search,
    string? status,
    int pageNumber,
    int pageSize
);
    
    // Get a doctor by ID
    Task<DoctorDto?> GetDoctorByIdAsync(int id);

    // Create a new doctor
    Task<int> AddDoctorAsync(CreateDoctorDto dto);
    
    // Update doctor details
    Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto);
    
    // Update doctor status (Active / Suspended)
    Task<bool> UpdateStatusAsync(int id, string status);
    
    // Soft delete a doctor
    Task<bool> DeleteDoctorAsync(int id);

    // Get expired doctors
    Task<IEnumerable<DoctorDto>> GetExpiredDoctorsAsync();

    //Get Doctor Summary
    Task<DoctorSummaryDto> GetDoctorSummaryAsync();

}