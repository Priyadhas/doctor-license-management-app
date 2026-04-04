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
            LOWER(ISNULL(LTRIM(RTRIM(Specialization)), '')) LIKE '%' + LOWER(@Search) + '%'
        )

            AND (
                @Status IS NULL OR
                Status = @Status
            )
        ";

        // TOTAL COUNT
        var totalCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) " + baseQuery,
            new { Search = search, Status = status }
        );

        var dataQuery = @"
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
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
        ";

        var data = await connection.QueryAsync<DoctorDto>(dataQuery, new
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

        var query = @"
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
            WHERE Id = @Id AND IsDeleted = 0
        ";

        return await connection.QueryFirstOrDefaultAsync<DoctorDto>(query, new { Id = id });
    }

    // ============================
    // CREATE
    // ============================
    public async Task<int> AddDoctorAsync(CreateDoctorDto dto)
    {
        ValidateCreate(dto);

        using var connection = _factory.CreateConnection();

        // 🔍 CHECK DUPLICATE LICENSE
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Doctors WHERE LicenseNumber = @LicenseNumber",
            new { dto.LicenseNumber }
        );

        if (exists > 0)
            throw new InvalidOperationException("License number already exists");

        // AUTO STATUS LOGIC
        string status;

        if (dto.LicenseExpiryDate.HasValue &&
            dto.LicenseExpiryDate.Value.Date < DateTime.UtcNow.Date)
        {
            status = "Expired";
        }
        else
        {
            status = NormalizeStatus(dto.Status);
        }

        var parameters = new
        {
            dto.FullName,
            dto.Email,
            dto.Specialization,
            dto.LicenseNumber,
            LicenseExpiryDate = dto.LicenseExpiryDate!.Value,
            Status = status
        };

        return await connection.ExecuteScalarAsync<int>(
            "AddDoctor",
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    // ============================
    // UPDATE
    // ============================
        public async Task<bool> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
    {
        ValidateUpdate(dto);

        using var connection = _factory.CreateConnection();

        await EnsureDoctorExists(connection, id);

        // AUTO STATUS LOGIC (IMPORTANT)
        string status;

        if (dto.LicenseExpiryDate.HasValue &&
            dto.LicenseExpiryDate.Value.Date < DateTime.UtcNow.Date)
        {
            status = "Expired";
        }
        else
        {
            status = NormalizeStatus(dto.Status);
        }

        var result = await connection.ExecuteAsync(@"
            UPDATE Doctors
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
                Status = status
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

        var result = await connection.ExecuteAsync(@"
            UPDATE Doctors 
            SET Status = @Status 
            WHERE Id = @Id AND IsDeleted = 0",
            new { Id = id, Status = NormalizeStatus(status) });

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
            new { Id = id });

        return result > 0;
    }

    // ============================
    // DOCTOR SUMMARY
    // ============================
    public async Task<DoctorSummaryDto> GetDoctorSummaryAsync()
    {
        using var connection = _factory.CreateConnection();

        var query = @"
            SELECT 
                COUNT(*) AS TotalDoctors,

                SUM(CASE 
                    WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 1 
                    ELSE 0 
                END) AS ExpiredDoctors,

                SUM(CASE 
                    WHEN LicenseExpiryDate >= CAST(GETDATE() AS DATE) 
                        AND Status = 'Active' THEN 1 
                    ELSE 0 
                END) AS ActiveDoctors

            FROM Doctors
            WHERE IsDeleted = 0;
        ";

        return await connection.QueryFirstAsync<DoctorSummaryDto>(query);
    }

    // ============================
    // EXPIRED DOCTORS
    // ============================
    public async Task<IEnumerable<DoctorDto>> GetExpiredDoctorsAsync()
    {
        using var connection = _factory.CreateConnection();

        var query = @"
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
            ORDER BY LicenseExpiryDate ASC
        ";

        return await connection.QueryAsync<DoctorDto>(query);
    }

    // ============================
    // HELPERS
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

        var allowedStatuses = new[] { "Active", "Suspended" ,"Expired"};

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
            new { Id = id });

        if (exists == 0)
            throw new KeyNotFoundException("Doctor not found");
    }

        // ============================
        // HELPERS
        // ============================
        public async Task<int> ExpireLicensesAsync()
        {
            using var connection = _factory.CreateConnection();

            return await connection.ExecuteAsync(@"
                UPDATE Doctors
                SET Status = 'Expired'
                WHERE LicenseExpiryDate < CAST(GETDATE() AS DATE)
                AND Status != 'Expired'
            ");
        }

}