using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using System.Data;
using System.Data.SqlClient;
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
        return new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
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