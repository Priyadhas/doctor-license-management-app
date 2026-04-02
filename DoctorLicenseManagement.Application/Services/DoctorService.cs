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

    public async Task<IEnumerable<dynamic>> GetAllDoctorsAsync()
    {
        using var connection = CreateConnection();

        var result = await connection.QueryAsync(
            "GetAllDoctors",
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        // VALIDATION
        if (dto.LicenseExpiryDate < new DateTime(1753, 1, 1))
        {
            throw new ArgumentException("Invalid License Expiry Date");
        }

        using var connection = CreateConnection();

        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            dto.LicenseExpiryDate,
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