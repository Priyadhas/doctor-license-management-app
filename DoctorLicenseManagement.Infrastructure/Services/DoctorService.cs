using Dapper;
using Microsoft.Data.SqlClient;
using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Domain.Entities;

namespace DoctorLicenseManagement.Infrastructure.Services;

public class DoctorService : IDoctorService
{
    private readonly string _connectionString;

    public DoctorService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<IEnumerable<Doctor>> GetAllAsync(string? search, string? status)
    {
        using var connection = new SqlConnection(_connectionString);

        return await connection.QueryAsync<Doctor>(
            "GetDoctors",
            new { Search = search, Status = status },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task<Doctor?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);

        return await connection.QueryFirstOrDefaultAsync<Doctor>(
            "SELECT * FROM Doctors WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateDoctorDto dto)
    {
        using var connection = new SqlConnection(_connectionString);

        // 🔥 Duplicate License Check
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
            throw new Exception("License number already exists");

        // 🔥 Auto Expiry Logic
        var status = dto.LicenseExpiryDate < DateTime.UtcNow ? "Expired" : "Active";

        var query = @"
        INSERT INTO Doctors 
        (FullName, Email, Specialization, LicenseNumber, LicenseExpiryDate, Status)
        VALUES (@FullName, @Email, @Specialization, @LicenseNumber, @LicenseExpiryDate, @Status);

        SELECT CAST(SCOPE_IDENTITY() as int);
        ";

        return await connection.ExecuteScalarAsync<int>(query, new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            dto.LicenseExpiryDate,
            Status = status
        });
    }

    public async Task UpdateAsync(int id, CreateDoctorDto dto)
    {
        using var connection = new SqlConnection(_connectionString);

        var status = dto.LicenseExpiryDate < DateTime.UtcNow ? "Expired" : "Active";

        var query = @"
        UPDATE Doctors
        SET FullName = @FullName,
            Email = @Email,
            Specialization = @Specialization,
            LicenseNumber = @LicenseNumber,
            LicenseExpiryDate = @LicenseExpiryDate,
            Status = @Status
        WHERE Id = @Id AND IsDeleted = 0";

        await connection.ExecuteAsync(query, new
        {
            id,
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            dto.LicenseExpiryDate,
            Status = status
        });
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);

        await connection.ExecuteAsync(
            "UPDATE Doctors SET IsDeleted = 1 WHERE Id = @Id",
            new { Id = id }
        );
    }
}