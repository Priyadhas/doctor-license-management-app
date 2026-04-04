CREATE OR ALTER PROCEDURE GetAllDoctors
    @Search NVARCHAR(100) = NULL,
    @Status NVARCHAR(50) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

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
        END AS Status
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
        AND Status != 'Suspended'
    )
    OR
    (
        @Status = 'Suspended'
        AND Status = 'Suspended'
    )
    OR
    (
        @Status = 'Active'
        AND Status = 'Active'
        AND LicenseExpiryDate >= CAST(GETDATE() AS DATE)
    )
)
    ORDER BY CreatedDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END