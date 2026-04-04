CREATE OR ALTER PROCEDURE AddDoctor
(
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Specialization NVARCHAR(100),
    @LicenseNumber NVARCHAR(50),
    @LicenseExpiryDate DATE,
    @Status NVARCHAR(20) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FinalStatus NVARCHAR(20);

    -- STEP 1: NORMALIZE INPUT STATUS
    SET @Status = LTRIM(RTRIM(ISNULL(@Status, 'Active')));

    IF (@Status NOT IN ('Active', 'Suspended', 'Expired'))
        SET @Status = 'Active';

    -- STEP 2: AUTO EXPIRED OVERRIDE
    IF (@LicenseExpiryDate < CAST(GETDATE() AS DATE))
        SET @FinalStatus = 'Expired';
    ELSE
        SET @FinalStatus = @Status;

    -- STEP 3: INSERT
    INSERT INTO Doctors
    (
        FullName,
        Email,
        Specialization,
        LicenseNumber,
        LicenseExpiryDate,
        Status,
        CreatedDate
    )
    VALUES
    (
        @FullName,
        @Email,
        @Specialization,
        @LicenseNumber,
        @LicenseExpiryDate,
        @FinalStatus,
        GETDATE()
    );

    -- STEP 4: RETURN ID
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END