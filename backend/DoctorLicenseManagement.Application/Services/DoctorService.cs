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
    public async Task<PaginatedResponse<DoctorDto>> GetAllDoctorsAsync(
        string? search,
        string? status,
        int pageNumber,
        int pageSize)
    {
        using var connection = _factory.CreateConnection();

        search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        status = string.IsNullOrWhiteSpace(status) ? null : status.Trim();

        if (pageNumber <= 0) pageNumber = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 10;

        var baseQuery = @"
            FROM Doctors
            WHERE IsDeleted = 0
            AND (
                @Search IS NULL OR
                LOWER(FullName) LIKE '%' + LOWER(@Search) + '%' OR
                LOWER(LicenseNumber) LIKE '%' + LOWER(@Search) + '%' OR
                LOWER(ISNULL(Specialization,'')) LIKE '%' + LOWER(@Search) + '%'
            )
            AND (
                @Status IS NULL OR
                (@Status = 'Expired' AND LicenseExpiryDate < GETDATE()) OR
                (@Status = 'Active' AND LicenseExpiryDate >= GETDATE() AND Status = 'Active') OR
                (@Status = 'Suspended' AND Status = 'Suspended')
            )
        ";

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) " + baseQuery,
            new { Search = search, Status = status });

        var data = await connection.QueryAsync<DoctorDto>(@"
            SELECT 
                Id,
                FullName,
                Email,
                Specialization,
                LicenseNumber,
                LicenseExpiryDate,
                CASE 
                    WHEN LicenseExpiryDate < GETDATE() THEN 'Expired'
                    ELSE Status
                END AS Status,
                CreatedDate
            " + baseQuery + @"
            ORDER BY CreatedDate DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY",
            new
            {
                Search = search,
                Status = status,
                Offset = (pageNumber - 1) * pageSize,
                PageSize = pageSize
            });

        return new PaginatedResponse<DoctorDto>
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            Data = data.ToList()
        };
    }

    // ============================
    // GET BY ID
    // ============================
    public async Task<DoctorDto?> GetDoctorByIdAsync(int id)
    {
        using var connection = _factory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<DoctorDto>(@"
            SELECT *
            FROM Doctors
            WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id });
    }

    // ============================
    // CREATE
    // ============================
    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        using var connection = _factory.CreateConnection();
        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            dto.FullName = dto.FullName.StartsWith("Dr.")
                ? dto.FullName
                : $"Dr. {dto.FullName}";

            var id = await connection.ExecuteScalarAsync<int>(
                "AddDoctor",
                new
                {
                    dto.FullName,
                    dto.Email,
                    dto.Specialization,
                    dto.LicenseNumber,
                    dto.LicenseExpiryDate,
                    Status = NormalizeStatus(dto.Status)
                },
                transaction,
                commandType: CommandType.StoredProcedure
            );

            // ACTIVITY
            await connection.ExecuteAsync(@"
                INSERT INTO ActivityLogs (Message, Type)
                VALUES (@Message, 'Added')",
                new { Message = $"{dto.FullName} added" },
                transaction);

            transaction.Commit();
            return id;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // ============================
    // UPDATE
    // ============================
    public async Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
    {
        using var connection = _factory.CreateConnection();
        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            dto.FullName = dto.FullName.StartsWith("Dr.")
                ? dto.FullName
                : $"Dr. {dto.FullName}";

            var result = await connection.ExecuteAsync(@"
                UPDATE Doctors
                SET FullName = @FullName,
                    Email = @Email,
                    Specialization = @Specialization,
                    LicenseExpiryDate = @LicenseExpiryDate,
                    Status = @Status
                WHERE Id = @Id",
                new
                {
                    Id = id,
                    dto.FullName,
                    dto.Email,
                    dto.Specialization,
                    dto.LicenseExpiryDate,
                    Status = NormalizeStatus(dto.Status)
                },
                transaction);

            //  ACTIVITY
            await connection.ExecuteAsync(@"
                INSERT INTO ActivityLogs (Message, Type)
                VALUES (@Message, 'Updated')",
                new { Message = $"{dto.FullName} updated" },
                transaction);

            transaction.Commit();
            return result > 0;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // ============================
    // UPDATE STATUS
    // ============================
    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = _factory.CreateConnection();

        var result = await connection.ExecuteAsync(@"
            UPDATE Doctors
            SET Status = @Status
            WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id, Status = NormalizeStatus(status) });

        await connection.ExecuteAsync(@"
            INSERT INTO ActivityLogs (Message, Type)
            VALUES (@Message, 'Status')",
            new { Message = $"Doctor status changed to {status}" });

        return result > 0;
    }

    // ============================
    // DELETE
    // ============================
    public async Task<bool> DeleteDoctorAsync(int id)
    {
        using var connection = _factory.CreateConnection();

        var doctor = await connection.QueryFirstOrDefaultAsync<DoctorDto>(
            "SELECT FullName FROM Doctors WHERE Id = @Id",
            new { Id = id });

        var result = await connection.ExecuteAsync(
            "UPDATE Doctors SET IsDeleted = 1 WHERE Id = @Id",
            new { Id = id });

        await connection.ExecuteAsync(@"
            INSERT INTO ActivityLogs (Message, Type)
            VALUES (@Message, 'Deleted')",
            new { Message = $"{doctor?.FullName} deleted" });

        return result > 0;
    }

    // ============================
    // SUMMARY
    // ============================
    public async Task<DoctorSummaryDto> GetDoctorSummaryAsync()
    {
        using var connection = _factory.CreateConnection();

        return await connection.QueryFirstAsync<DoctorSummaryDto>(@"
            SELECT 
                COUNT(*) AS TotalDoctors,
                SUM(CASE WHEN LicenseExpiryDate < GETDATE() THEN 1 ELSE 0 END) AS ExpiredDoctors,
                SUM(CASE WHEN LicenseExpiryDate >= GETDATE() AND Status = 'Active' THEN 1 ELSE 0 END) AS ActiveDoctors
            FROM Doctors
            WHERE IsDeleted = 0
        ");
    }

    // ============================
    // EXPIRED DOCTORS
    // ============================
    public async Task<IEnumerable<DoctorDto>> GetExpiredDoctorsAsync()
    {
        using var connection = _factory.CreateConnection();

        return await connection.QueryAsync<DoctorDto>(@"
            SELECT *
            FROM Doctors
            WHERE LicenseExpiryDate < GETDATE()
            AND IsDeleted = 0
        ");
    }

    // ============================
    // EXPIRE LICENSES
    // ============================
    public async Task<int> ExpireLicensesAsync()
    {
        using var connection = _factory.CreateConnection();

        var result = await connection.ExecuteAsync(@"
            UPDATE Doctors
            SET Status = 'Expired'
            WHERE LicenseExpiryDate < GETDATE()
            AND Status != 'Expired'
        ");

        await connection.ExecuteAsync(@"
            INSERT INTO ActivityLogs (Message, Type)
            VALUES ('Bulk expiry executed', 'System')");

        return result;
    }

    // ============================
    // ACTIVITY
    // ============================
    public async Task<IEnumerable<ActivityDto>> GetRecentActivitiesAsync()
    {
        using var connection = _factory.CreateConnection();

        return await connection.QueryAsync<ActivityDto>(@"
            SELECT TOP 5 Message, Type, CreatedAt
            FROM ActivityLogs
            ORDER BY CreatedAt DESC
        ");
    }

    // ============================
    // HELPERS
    // ============================
    private static string NormalizeStatus(string status)
    {
        return char.ToUpper(status[0]) + status.Substring(1).ToLower();
    }
}