CREATE OR ALTER PROCEDURE AddDoctor
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Specialization NVARCHAR(100),
    @LicenseNumber NVARCHAR(50),
    @LicenseExpiryDate DATE,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Duplicate check
    IF EXISTS (
        SELECT 1 FROM Doctors WHERE LicenseNumber = @LicenseNumber
    )
    BEGIN
        RAISERROR('License number already exists', 16, 1);
        RETURN;
    END

    INSERT INTO Doctors (
        FullName,
        Email,
        Specialization,
        LicenseNumber,
        LicenseExpiryDate,
        Status
    )
    VALUES (
        @FullName,
        @Email,
        @Specialization,
        @LicenseNumber,
        @LicenseExpiryDate,
        @Status
    );

    -- RETURN NEW ID
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END