CREATE OR ALTER PROCEDURE GetAllDoctors
    @Search NVARCHAR(100) = NULL,
    @Status NVARCHAR(50) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Normalize inputs
    SET @Search = LTRIM(RTRIM(@Search));
    SET @Status = LTRIM(RTRIM(@Status));

    SELECT 
        Id,
        FullName,
        Email,
        Specialization,
        LicenseNumber,
        LicenseExpiryDate,

        -- Smart status handling
        CASE 
            WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 'Expired'
            ELSE Status
        END AS Status,

        CreatedDate

    FROM Doctors
    WHERE IsDeleted = 0

    -- SMART SEARCH LOGIC
    AND (
        @Search IS NULL OR
        (
            -- If searching by License (exact match)
            (@Search LIKE 'LIC%' AND LicenseNumber = @Search)

            OR

            -- Otherwise search by name
            (@Search NOT LIKE 'LIC%' AND FullName LIKE '%' + @Search + '%')
        )
    )

    -- STATUS FILTER (CASE INSENSITIVE)
    AND (
        @Status IS NULL OR
        Status = @Status COLLATE SQL_Latin1_General_CP1_CI_AS
    )

    -- ORDERING (IMPORTANT FOR PAGINATION)
    ORDER BY CreatedDate DESC

    -- PAGINATION
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;