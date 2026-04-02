-- =============================================
-- IDEMPOTENT DATABASE SETUP SCRIPT
-- =============================================

-- CREATE TABLE
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Doctors' AND xtype='U')
BEGIN
    CREATE TABLE Doctors (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(100),
        Email NVARCHAR(100),
        Specialization NVARCHAR(100),
        LicenseNumber NVARCHAR(50) UNIQUE,
        LicenseExpiryDate DATE,
        Status NVARCHAR(50),
        CreatedDate DATETIME DEFAULT GETDATE(),
        IsDeleted BIT DEFAULT 0
    );
END
GO

-- ADD CONSTRAINT (SAFE)
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CHK_Status'
)
BEGIN
    ALTER TABLE Doctors
    ADD CONSTRAINT CHK_Status
    CHECK (Status IN ('Active', 'Suspended'));
END
GO

-- =============================================
-- CREATE TABLE (SAFE)
-- =============================================
IF OBJECT_ID('dbo.Doctors', 'U') IS NULL
BEGIN
    PRINT 'Creating Doctors Table...';

    CREATE TABLE Doctors (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        Specialization NVARCHAR(100),
        LicenseNumber NVARCHAR(50) NOT NULL UNIQUE,
        LicenseExpiryDate DATE NOT NULL,
        Status NVARCHAR(50) NOT NULL,
        IsDeleted BIT DEFAULT 0,
        CreatedDate DATETIME DEFAULT GETDATE()
    );
END
ELSE
BEGIN
    PRINT 'Doctors Table already exists';
END
GO

-- =============================================
-- INDEX (PERFORMANCE - TOP 1% DETAIL)
-- =============================================
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'IX_Doctors_LicenseNumber'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Doctors_LicenseNumber
    ON Doctors(LicenseNumber);
END
GO

-- =============================================
-- STORED PROCEDURE: GET ALL
-- =============================================
CREATE OR ALTER PROCEDURE GetAllDoctors
    @Search NVARCHAR(100) = NULL,
    @Status NVARCHAR(50) = NULL
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

        -- AUTO EXPIRY LOGIC
        CASE 
            WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 'Expired'
            ELSE Status
        END AS Status,

        CreatedDate

    FROM Doctors
    WHERE IsDeleted = 0

    -- SEARCH
    AND (
        @Search IS NULL OR
        FullName LIKE '%' + @Search + '%' OR
        LicenseNumber LIKE '%' + @Search + '%'
    )

    -- FILTER
    AND (
        @Status IS NULL OR
        Status = @Status
    )

    ORDER BY CreatedDate DESC;
END
GO

-- =============================================
-- STORED PROCEDURE: ADD DOCTOR
-- =============================================
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

    -- DUPLICATE CHECK (DOUBLE SAFETY)
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
END
GO

-- =============================================
-- STORED PROCEDURE: UPDATE DOCTOR
-- =============================================
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

    UPDATE Doctors
    SET 
        FullName = @FullName,
        Email = @Email,
        Specialization = @Specialization,
        LicenseExpiryDate = @LicenseExpiryDate,
        Status = @Status
    WHERE Id = @Id AND IsDeleted = 0;
END
GO

-- =============================================
-- STORED PROCEDURE: SOFT DELETE
-- =============================================
CREATE OR ALTER PROCEDURE DeleteDoctor
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Doctors
    SET IsDeleted = 1
    WHERE Id = @Id;
END
GO

-- =============================================
-- STORED PROCEDURE: UPDATE STATUS
-- =============================================
CREATE OR ALTER PROCEDURE UpdateDoctorStatus
    @Id INT,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Doctors
    SET Status = @Status
    WHERE Id = @Id AND IsDeleted = 0;
END
GO

-- =============================================
-- OPTIONAL SEED DATA (SAFE)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Doctors)
BEGIN
    PRINT 'Inserting sample data...';

    INSERT INTO Doctors (FullName, Email, Specialization, LicenseNumber, LicenseExpiryDate, Status)
    VALUES
    ('Dr John Doe', 'john@test.com', 'Cardiology', 'LIC10001', '2027-12-31', 'Active'),
    ('Dr Smith', 'smith@test.com', 'Neurology', 'LIC10002', '2025-01-01', 'Active');
END
GO

PRINT 'Database setup completed successfully!';