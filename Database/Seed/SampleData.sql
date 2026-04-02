USE DoctorDB;
GO

IF NOT EXISTS (SELECT 1 FROM Doctors)
BEGIN
    INSERT INTO Doctors (FullName, Email, Specialization, LicenseNumber, LicenseExpiryDate, Status)
    VALUES
    ('Dr priya', 'priya@test.com', 'Cardiology', 'LIC10001', '2027-12-31', 'Active'),
('Dr Bergith', 'bergith@test.com', 'Neurology', 'LIC10002', '2025-01-01', 'Active');
END
GO
