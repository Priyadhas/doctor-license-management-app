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
                LOWER(ISNULL(Specialization, '')) LIKE '%' + LOWER(@Search) + '%'
            )

            AND (
                @Status IS NULL OR
                (
                    @Status = 'Expired'
                    AND LicenseExpiryDate < CAST(GETDATE() AS DATE)
                )
                OR
                (
                    @Status = 'Active'
                    AND LicenseExpiryDate >= CAST(GETDATE() AS DATE)
                    AND Status = 'Active'
                )
                OR
                (
                    @Status = 'Suspended'
                    AND Status = 'Suspended'
                )
            )
        ";

        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) " + baseQuery,
            new { Search = search, Status = status }
        );

        var data = await connection.QueryAsync<DoctorDto>(@"
            SELECT 
                Id,
                FullName,
                Email,
                Specialization,
                LicenseNumber,
                LicenseExpiryDate,
                CASE 
                    WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 'Expired'
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
            SELECT 
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
            new { Id = id });
    }

    // ============================
    // CREATE
    // ============================
    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        ValidateCreate(dto);

        using var connection = _factory.CreateConnection();

        dto.FullName = FormatName(dto.FullName);

        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber });

        if (exists > 0)
            throw new InvalidOperationException("License number already exists");

        var status = GetStatus(dto.LicenseExpiryDate, dto.Status);

        var id = await connection.ExecuteScalarAsync<int>(
            "AddDoctor",
            new
            {
                dto.FullName,
                dto.Email,
                dto.Specialization,
                dto.LicenseNumber,
                LicenseExpiryDate = dto.LicenseExpiryDate!.Value,
                Status = status
            },
            commandType: CommandType.StoredProcedure);

        await LogActivity(connection, $"{dto.FullName} added", "Added");

        return id;
    }

    // ============================
    // UPDATE
    // ============================
    public async Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
    {
        ValidateUpdate(dto);

        using var connection = _factory.CreateConnection();
        using var transaction = connection.BeginTransaction();

        try
        {
            await EnsureDoctorExists(connection, id);

            dto.FullName = FormatName(dto.FullName);
            var status = GetStatus(dto.LicenseExpiryDate, dto.Status);

            var result = await connection.ExecuteAsync(@"
                UPDATE Doctors
                SET FullName = @FullName,
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
                    Status = status
                },
                transaction);

            await LogActivity(connection, $"{dto.FullName} updated", "Updated", transaction);

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

        await EnsureDoctorExists(connection, id);

        var normalized = NormalizeStatus(status);

        var result = await connection.ExecuteAsync(@"
            UPDATE Doctors
            SET Status = @Status
            WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id, Status = normalized });

        await LogActivity(connection, $"Doctor status changed to {normalized}", "Status");

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

        var name = doctor?.FullName ?? "Doctor";

        await LogActivity(connection, $"{name} deleted", "Deleted");

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
            WHERE IsDeleted = 0");
    }

    // ============================
    // EXPIRED DOCTORS
    // ============================
    public async Task<IEnumerable<DoctorDto>> GetExpiredDoctorsAsync()
    {
        using var connection = _factory.CreateConnection();

        return await connection.QueryAsync<DoctorDto>(@"
            SELECT 
                Id,
                FullName,
                Email,
                Specialization,
                LicenseNumber,
                LicenseExpiryDate,
                'Expired' AS Status,
                CreatedDate
            FROM Doctors
            WHERE IsDeleted = 0
            AND LicenseExpiryDate < CAST(GETDATE() AS DATE)
            ORDER BY LicenseExpiryDate ASC");
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
            AND Status != 'Expired'");

        await LogActivity(connection, "Bulk license expiry executed", "System");

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
            ORDER BY CreatedAt DESC");
    }

    // ============================
    // HELPERS
    // ============================

    private static string FormatName(string name)
    {
        return name.StartsWith("Dr.", StringComparison.OrdinalIgnoreCase)
            ? name.Trim()
            : $"Dr. {name.Trim()}";
    }

    private static string GetStatus(DateTime? expiry, string status)
    {
        if (expiry.HasValue && expiry.Value.Date < DateTime.UtcNow.Date)
            return "Expired";

        return NormalizeStatus(status);
    }

    private static async Task LogActivity(IDbConnection connection, string message, string type, IDbTransaction? transaction = null)
    {
        await connection.ExecuteAsync(@"
            INSERT INTO ActivityLogs (Message, Type)
            VALUES (@Message, @Type)",
            new { Message = message, Type = type },
            transaction);
    }

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

    private static async Task EnsureDoctorExists(IDbConnection connection, int id)
    {
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id });

        if (exists == 0)
            throw new KeyNotFoundException("Doctor not found");
    }

    private static string NormalizeStatus(string status)
    {
        return char.ToUpper(status[0]) + status.Substring(1).ToLower();
    }
}