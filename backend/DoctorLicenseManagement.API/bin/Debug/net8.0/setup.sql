-- =============================================
-- DATABASE CREATION
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DoctorDB')
BEGIN
    CREATE DATABASE DoctorDB;
END
GO

USE DoctorDB;
GO

-- =============================================
-- CREATE DOCTORS TABLE
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
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
ELSE
BEGIN
    PRINT 'Doctors Table already exists';
END
GO

-- =============================================
-- CREATE USERS TABLE (JWT + RESET PASSWORD)
-- =============================================

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    PRINT 'Creating Users Table...';

    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,

        Email NVARCHAR(100) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'User',

        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),

        -- NEW FIELDS FOR PASSWORD RESET
        ResetToken NVARCHAR(500) NULL,
        ResetTokenExpiry DATETIME NULL
    );
END
ELSE
BEGIN
    PRINT 'Users Table already exists';

    IF COL_LENGTH('Users', 'ResetToken') IS NULL
    BEGIN
        ALTER TABLE Users
        ADD ResetToken NVARCHAR(500) NULL;

        PRINT 'Added ResetToken column';
    END

    IF COL_LENGTH('Users', 'ResetTokenExpiry') IS NULL
    BEGIN
        ALTER TABLE Users
        ADD ResetTokenExpiry DATETIME NULL;

        PRINT 'Added ResetTokenExpiry column';
    END
END
GO

-- =============================================
-- ACTIVITY TABLE
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLogs' AND xtype='U')
BEGIN
    CREATE TABLE ActivityLogs (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Message NVARCHAR(255) NOT NULL,
        Type NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    )
END

-- =============================================
-- CLEAN INVALID STATUS DATA
-- =============================================
UPDATE Doctors
SET Status = 'Active'
WHERE Status NOT IN ('Active', 'Suspended','Expired');
GO

-- =============================================
-- ADD STATUS CHECK CONSTRAINT
-- =============================================
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints 
    WHERE name = 'CHK_Status'
)
BEGIN
    ALTER TABLE Doctors
    ADD CONSTRAINT CHK_Status
    CHECK (Status IN ('Active', 'Suspended','Expired'));
END
GO

-- =============================================
-- DEFAULT STATUS
-- =============================================
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints 
    WHERE name = 'DF_Doctors_Status'
)
BEGIN
    ALTER TABLE Doctors
    ADD CONSTRAINT DF_Doctors_Status DEFAULT 'Active' FOR Status;
END
GO

-- =============================================
-- INDEXES (PERFORMANCE)
-- =============================================
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'IX_Doctors_LicenseNumber'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Doctors_LicenseNumber
    ON Doctors(LicenseNumber);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Email'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Email
    ON Users(Email);
END
GO

-- =============================================
-- STORED PROCEDURE: GET ALL DOCTORS
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

        CASE 
            WHEN LicenseExpiryDate < CAST(GETDATE() AS DATE) THEN 'Expired'
            ELSE Status
        END AS Status,

        CreatedDate

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

    SELECT CAST(SCOPE_IDENTITY() AS INT);
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
-- STORED PROCEDURE: DELETE DOCTOR (SOFT)
-- =============================================
CREATE OR ALTER PROCEDURE DeleteDoctor
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Doctors
    SET IsDeleted = 1
    WHERE Id = @Id AND IsDeleted = 0;
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
-- STORED PROCEDURE: GET EXPIRED DOCTORS
-- =============================================
CREATE OR ALTER PROCEDURE GetExpiredDoctors
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
        'Expired' AS Status,
        CreatedDate
    FROM Doctors
    WHERE IsDeleted = 0
    AND LicenseExpiryDate < CAST(GETDATE() AS DATE)
END
GO

-- =============================================
-- SEED DOCTORS
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Doctors)
BEGIN
    PRINT 'Inserting sample doctors...';

    INSERT INTO Doctors (FullName, Email, Specialization, LicenseNumber, LicenseExpiryDate, Status)
    VALUES
    ('Dr John Doe', 'john@test.com', 'Cardiology', 'LIC10001', '2027-12-31', 'Active'),
    ('Dr Smith', 'smith@test.com', 'Neurology', 'LIC10002', '2025-01-01', 'Active');
END
GO

-- =============================================
-- SEED USERS (UPDATED - SAFE & LATEST)
-- =============================================

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'priyamariadhas@gmail.com')
BEGIN
    PRINT 'Inserting default admin user...';

    INSERT INTO Users (
        Email,
        Password,
        Role,
        CreatedDate,
        ResetToken,
        ResetTokenExpiry
    )
    VALUES (
        'priyamariadhas@gmail.com',

        --TEMP PASSWORD (PLAIN for now)
        -- Later replace with HASH from backend
        'Admin@963',

        'Admin',
        GETDATE(),
        NULL,
        NULL
    );
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

PRINT 'DATABASE SETUP COMPLETED SUCCESSFULLY!';