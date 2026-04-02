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

    public async Task<IEnumerable<DoctorDto>> GetAllDoctorsAsync()
    {
        using var connection = CreateConnection();

        var result = await connection.QueryAsync<DoctorDto>(
            "GetAllDoctors",
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        // VALIDATION
        if (dto.LicenseExpiryDate == null)
        {
            throw new ArgumentException("License Expiry Date is required");
        }

        if (dto.LicenseExpiryDate < new DateTime(1753, 1, 1))
        {
            throw new ArgumentException("Invalid License Expiry Date");
        }

        using var connection = CreateConnection();

        // CHECK DUPLICATE
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
        {
            throw new Exception("License number already exists");
        }

        // INSERT
        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate.Value,
            dto.Status
        };

        var result = await connection.ExecuteAsync(
            "AddDoctor",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }
}