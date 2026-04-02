CREATE OR ALTER PROCEDURE AddDoctor
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Specialization NVARCHAR(100),
    @LicenseNumber NVARCHAR(50),
    @LicenseExpiryDate DATE,
    @Status NVARCHAR(50)
AS
BEGIN
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
END;