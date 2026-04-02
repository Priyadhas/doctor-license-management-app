using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

namespace DoctorLicenseManagement.Application.Services;

public class DoctorService : IDoctorService
{
    private IDbConnection CreateConnection()
    {
        return new SqlConnection(
            "Server=localhost\\SQLEXPRESS;Database=DoctorDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
        );
    }

    public async Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync(string? search, string? status)
    {
        using var connection = CreateConnection();

        var result = await connection.QueryAsync<DoctorDto>(
            "GetAllDoctors",
            new { Search = search, Status = status },
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
        {
    using var connection = CreateConnection();

    var result = await connection.QueryFirstOrDefaultAsync<DoctorDto>(
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

    return result;
}

    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        if (dto.LicenseExpiryDate == null)
            throw new ArgumentException("License Expiry Date is required");

        using var connection = CreateConnection();

        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
            throw new Exception("License number already exists");

        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate.Value,
            dto.Status
        };

        return await connection.ExecuteAsync("AddDoctor", parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> UpdateDoctorAsync(int id, CreateDoctorDto dto)
    {
        using var connection = CreateConnection();

        var query = @"UPDATE Doctors SET
                        FullName = @FullName,
                        Email = @Email,
                        Specialization = @Specialization,
                        LicenseExpiryDate = @LicenseExpiryDate,
                        Status = @Status
                      WHERE Id = @Id";

        var result = await connection.ExecuteAsync(query, new
        {
            Id = id,
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseExpiryDate,
            dto.Status
        });

        return result > 0;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = CreateConnection();

        var result = await connection.ExecuteAsync(
            "UPDATE Doctors SET Status = @Status WHERE Id = @Id",
            new { Id = id, Status = status }
        );

        return result > 0;
    }

    public async Task<bool> DeleteDoctorAsync(int id)
    {
        using var connection = CreateConnection();

        var result = await connection.ExecuteAsync(
            "UPDATE Doctors SET IsDeleted = 1 WHERE Id = @Id",
            new { Id = id }
        );

        return result > 0;
    }
}