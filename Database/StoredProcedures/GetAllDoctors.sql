CREATE OR ALTER PROCEDURE GetAllDoctors
    @Search NVARCHAR(100) = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
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
        FullName LIKE '%' + @Search + '%' OR
        LicenseNumber LIKE '%' + @Search + '%'
    )
    AND (
        @Status IS NULL OR
        Status = @Status
    );
END;