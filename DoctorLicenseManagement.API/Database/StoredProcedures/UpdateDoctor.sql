CREATE OR ALTER PROCEDURE UpdateDoctor
    @Id INT,
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Specialization NVARCHAR(100),
    @LicenseExpiryDate DATE,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- CHECK IF DOCTOR EXISTS
    IF NOT EXISTS (
        SELECT 1 FROM Doctors 
        WHERE Id = @Id AND IsDeleted = 0
    )
    BEGIN
        RAISERROR('Doctor not found', 16, 1);
        RETURN;
    END

    -- UPDATE DOCTOR
    UPDATE Doctors
    SET 
        FullName = @FullName,
        Email = @Email,
        Specialization = @Specialization,
        LicenseExpiryDate = @LicenseExpiryDate,
        Status = @Status
    WHERE Id = @Id;

END;
GO