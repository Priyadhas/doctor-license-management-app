using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.Extensions.Configuration;

namespace DoctorLicenseManagement.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IConfiguration _configuration;

    public DoctorService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private IDbConnection CreateConnection()
    {
        return new SqlConnection(
            _configuration.GetConnectionString("DefaultConnection")
        );
    }

    // ============================
    // 🔍 GET ALL (SEARCH + FILTER)
    // ============================
    public async Task<IReadOnlyList<DoctorDto>> GetAllDoctorsAsync(string? search, string? status)
    {
        using var connection = CreateConnection();

        search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        status = string.IsNullOrWhiteSpace(status) ? null : status.Trim();

        var result = await connection.QueryAsync<DoctorDto>(
            "GetAllDoctors",
            new { Search = search, Status = status },
            commandType: CommandType.StoredProcedure
        );

        return result.ToList();
    }

    // ============================
    // 🔍 GET BY ID
    // ============================
    public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
    {
        using var connection = CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<DoctorDto>(
            @"SELECT 
                Id,
                FullName,
                Email,
                Specialization,
                LicenseNumber,
                LicenseExpiryDate,
                CASE 
                    WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 'Expired'
                    ELSE Status
                END AS Status
              FROM Doctors
              WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id }
        );
    }

    // ============================
    // ➕ CREATE
    // ============================
    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        ValidateCreate(dto);

        using var connection = CreateConnection();

        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
            throw new InvalidOperationException("License number already exists");

        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate!.Value,
            Status = NormalizeStatus(dto.Status)
        };

        return await connection.ExecuteAsync(
            "AddDoctor",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    // ============================
    // ✏️ UPDATE
    // ============================
    public async Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
    {
        ValidateUpdate(dto);

        using var connection = CreateConnection();

        await EnsureDoctorExists(connection, id);

        var result = await connection.ExecuteAsync(
            @"UPDATE Doctors
              SET 
                FullName = @FullName,
                Email = @Email,
                Specialization = @Specialization,
                LicenseExpiryDate = @LicenseExpiryDate,
                Status = @Status
              WHERE Id = @Id AND IsDeleted = 0",
            new
            {
                Id = id,
                dto.FullName,
                dto.Email,
                dto.Specialization,
                dto.LicenseExpiryDate,
                Status = NormalizeStatus(dto.Status)
            });

        return result > 0;
    }

    // ============================
    // 🔄 UPDATE STATUS
    // ============================
    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = CreateConnection();

        ValidateStatus(status);

        await EnsureDoctorExists(connection, id);

        var normalizedStatus = NormalizeStatus(status);

        var result = await connection.ExecuteAsync(
            @"UPDATE Doctors 
              SET Status = @Status 
              WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id, Status = normalizedStatus });

        return result > 0;
    }

    // ============================
    // 🗑️ SOFT DELETE
    // ============================
    public async Task<bool> DeleteDoctorAsync(int id)
    {
        using var connection = CreateConnection();

        await EnsureDoctorExists(connection, id);

        var result = await connection.ExecuteAsync(
            "UPDATE Doctors SET IsDeleted = 1 WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id }
        );

        return result > 0;
    }

    // ============================
    // 🔒 PRIVATE HELPERS
    // ============================

    private static void ValidateCreate(CreateDoctorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Full Name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(dto.LicenseNumber))
            throw new ArgumentException("License Number is required");

        if (dto.LicenseExpiryDate == null)
            throw new ArgumentException("License Expiry Date is required");
    }

    private static void ValidateUpdate(UpdateDoctorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Full Name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email is required");
    }

    private static void ValidateStatus(string status)
    {
        var allowedStatuses = new[] { "Active", "Suspended" };

        if (!allowedStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("Invalid status value");
    }

    private static string NormalizeStatus(string status)
    {
        return char.ToUpper(status[0]) + status.Substring(1).ToLower();
    }

    private static async Task EnsureDoctorExists(IDbConnection connection, int id)
    {
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id }
        );

        if (exists == 0)
            throw new KeyNotFoundException("Doctor not found");
    }
}