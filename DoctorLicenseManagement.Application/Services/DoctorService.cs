using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using System.Data;
using Dapper;

namespace DoctorLicenseManagement.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IDbConnectionFactory _factory;

    public DoctorService(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    // ============================
    // GET ALL (SEARCH + FILTER + PAGINATION)
    // ============================
    public async Task<IReadOnlyList<DoctorDto>> GetAllDoctorsAsync(
    string? search,
    string? status,
    int pageNumber,
    int pageSize)
{
    using var connection = _factory.CreateConnection();

    // Normalize inputs
    search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
    status = string.IsNullOrWhiteSpace(status) ? null : status.Trim();

    // Safety defaults
    if (pageNumber <= 0) pageNumber = 1;
    if (pageSize <= 0 || pageSize > 100) pageSize = 10;

    // 🚨 ONLY PASS PARAMETERS THAT SQL SUPPORTS
    var result = await connection.QueryAsync<DoctorDto>(
        "GetAllDoctors",
        new
        {
            Search = search,
            Status = status
        },
        commandType: CommandType.StoredProcedure
    );

    var data = result.ToList();

    // ============================
    // APPLY PAGINATION IN CODE
    // ============================
    var paginatedData = data
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToList();

    return paginatedData;
}

    // ============================
    // GET BY ID
    // ============================
    public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
    {
        using var connection = _factory.CreateConnection();

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
    // CREATE
    // ============================
    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        ValidateCreate(dto);

        using var connection = _factory.CreateConnection();

        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
            throw new InvalidOperationException("License number already exists");

        if (dto.LicenseExpiryDate == null)
            throw new ArgumentException("License Expiry Date is required");

        if (dto.LicenseExpiryDate < DateTime.Today)
            throw new ArgumentException("License expiry date cannot be in the past"); 
        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate!.Value,
            Status = NormalizeStatus(dto.Status)
        };

        var id = await connection.ExecuteScalarAsync<int>(
            "AddDoctor",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return id;
    }

    // ============================
    // UPDATE
    // ============================
    public async Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
    {
        ValidateUpdate(dto);

        using var connection = _factory.CreateConnection();

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
    // UPDATE STATUS
    // ============================
    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = _factory.CreateConnection();

        ValidateStatus(status);

        await EnsureDoctorExists(connection, id);

        var result = await connection.ExecuteAsync(
            @"UPDATE Doctors 
              SET Status = @Status 
              WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id, Status = NormalizeStatus(status) }
        );

        return result > 0;
    }

    // ============================
    // SOFT DELETE
    // ============================
    public async Task<bool> DeleteDoctorAsync(int id)
    {
        using var connection = _factory.CreateConnection();

        await EnsureDoctorExists(connection, id);

        var result = await connection.ExecuteAsync(
            "UPDATE Doctors SET IsDeleted = 1 WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id }
        );

        return result > 0;
    }

    // ============================
    // PRIVATE HELPERS
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
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Status is required");

        var allowedStatuses = new[] { "Active", "Suspended" };

        if (!allowedStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("Invalid status value");
    }

    private static string NormalizeStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Status is required");

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