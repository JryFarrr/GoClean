-- ===========================================
-- GoClean Database Schema for SQL Server
-- Created: December 21, 2025
-- ===========================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'goclean')
BEGIN
    CREATE DATABASE goclean;
END
GO

USE goclean;
GO

-- ===========================================
-- DROP EXISTING TABLES (for fresh start)
-- ===========================================
IF OBJECT_ID('dbo.Review', 'U') IS NOT NULL DROP TABLE dbo.Review;
IF OBJECT_ID('dbo.Booking', 'U') IS NOT NULL DROP TABLE dbo.Booking;
IF OBJECT_ID('dbo.CleanerService', 'U') IS NOT NULL DROP TABLE dbo.CleanerService;
IF OBJECT_ID('dbo.Service', 'U') IS NOT NULL DROP TABLE dbo.Service;
IF OBJECT_ID('dbo.Cleaner', 'U') IS NOT NULL DROP TABLE dbo.Cleaner;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ===========================================
-- USERS TABLE
-- Menyimpan data semua pengguna (customer, cleaner, admin)
-- ===========================================
CREATE TABLE Users (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    latitude FLOAT,
    longitude FLOAT,
    role NVARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'cleaner', 'admin')),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ===========================================
-- CLEANER TABLE
-- Detail khusus untuk user dengan role cleaner
-- ===========================================
CREATE TABLE Cleaner (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    userId NVARCHAR(450) NOT NULL UNIQUE,
    bio NVARCHAR(MAX),
    experience INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    totalReviews INT DEFAULT 0,
    isAvailable BIT DEFAULT 1,
    latitude FLOAT,
    longitude FLOAT,
    serviceArea FLOAT DEFAULT 10, -- radius layanan dalam km
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Cleaner_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- ===========================================
-- SERVICE TABLE
-- Daftar layanan yang tersedia
-- ===========================================
CREATE TABLE Service (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    basePrice DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL, -- durasi dalam menit
    category NVARCHAR(100),
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ===========================================
-- CLEANER SERVICE TABLE (Many-to-Many)
-- Menghubungkan cleaner dengan layanan yang mereka tawarkan
-- ===========================================
CREATE TABLE CleanerService (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    cleanerId NVARCHAR(450) NOT NULL,
    serviceId NVARCHAR(450) NOT NULL,
    customPrice DECIMAL(10,2), -- harga custom dari cleaner
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CleanerService_Cleaner FOREIGN KEY (cleanerId) REFERENCES Cleaner(id) ON DELETE CASCADE,
    CONSTRAINT FK_CleanerService_Service FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE,
    CONSTRAINT UQ_CleanerService UNIQUE (cleanerId, serviceId)
);
GO

-- ===========================================
-- BOOKING TABLE
-- Menyimpan data pemesanan layanan
-- ===========================================
CREATE TABLE Booking (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    userId NVARCHAR(450) NOT NULL,
    cleanerId NVARCHAR(450) NOT NULL,
    serviceId NVARCHAR(450) NOT NULL,
    bookingDate DATE NOT NULL,
    bookingTime TIME NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    totalPrice DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes NVARCHAR(MAX),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Booking_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE NO ACTION,
    CONSTRAINT FK_Booking_Cleaner FOREIGN KEY (cleanerId) REFERENCES Cleaner(id) ON DELETE NO ACTION,
    CONSTRAINT FK_Booking_Service FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE NO ACTION
);
GO

-- ===========================================
-- REVIEW TABLE
-- Menyimpan ulasan dari customer setelah booking selesai
-- ===========================================
CREATE TABLE Review (
    id NVARCHAR(450) PRIMARY KEY DEFAULT NEWID(),
    bookingId NVARCHAR(450) NOT NULL UNIQUE,
    userId NVARCHAR(450) NOT NULL,
    cleanerId NVARCHAR(450) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Review_Booking FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
    CONSTRAINT FK_Review_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE NO ACTION,
    CONSTRAINT FK_Review_Cleaner FOREIGN KEY (cleanerId) REFERENCES Cleaner(id) ON DELETE NO ACTION
);
GO

-- ===========================================
-- HAVERSINE FUNCTION
-- Menghitung jarak antara dua titik koordinat (lat/lon)
-- Digunakan untuk mencari cleaner terdekat
-- ===========================================
CREATE OR ALTER FUNCTION dbo.fn_Haversine (
    @lat1 FLOAT,  -- Latitude titik 1 (customer)
    @lon1 FLOAT,  -- Longitude titik 1 (customer)
    @lat2 FLOAT,  -- Latitude titik 2 (cleaner)
    @lon2 FLOAT   -- Longitude titik 2 (cleaner)
)
RETURNS FLOAT
AS
BEGIN
    DECLARE @R FLOAT = 6371; -- Radius bumi dalam kilometer
    DECLARE @dLat FLOAT;
    DECLARE @dLon FLOAT;
    DECLARE @a FLOAT;
    DECLARE @c FLOAT;
    DECLARE @distance FLOAT;

    -- Konversi perbedaan derajat ke radian
    SET @dLat = RADIANS(@lat2 - @lat1);
    SET @dLon = RADIANS(@lon2 - @lon1);
    
    -- Rumus Haversine
    -- a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
    SET @a = SIN(@dLat / 2) * SIN(@dLat / 2) +
             COS(RADIANS(@lat1)) * COS(RADIANS(@lat2)) *
             SIN(@dLon / 2) * SIN(@dLon / 2);
    
    -- c = 2 × atan2(√a, √(1-a))
    SET @c = 2 * ATN2(SQRT(@a), SQRT(1 - @a));
    
    -- distance = R × c
    SET @distance = @R * @c;
    
    RETURN @distance; -- Hasil dalam kilometer
END;
GO

-- ===========================================
-- STORED PROCEDURE: Cari Cleaner Terdekat
-- Menggunakan fungsi Haversine untuk filter berdasarkan radius
-- ===========================================
CREATE OR ALTER PROCEDURE sp_GetNearbyCleaners
    @customerLat FLOAT,
    @customerLon FLOAT,
    @radiusKm FLOAT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.id,
        u.name,
        u.email,
        u.phone,
        c.bio,
        c.experience,
        c.rating,
        c.totalReviews,
        c.latitude,
        c.longitude,
        c.serviceArea,
        dbo.fn_Haversine(@customerLat, @customerLon, c.latitude, c.longitude) AS distanceKm
    FROM Cleaner c
    INNER JOIN Users u ON c.userId = u.id
    WHERE c.isAvailable = 1
      AND c.latitude IS NOT NULL
      AND c.longitude IS NOT NULL
      AND dbo.fn_Haversine(@customerLat, @customerLon, c.latitude, c.longitude) <= @radiusKm
    ORDER BY distanceKm ASC;
END;
GO

-- ===========================================
-- STORED PROCEDURE: Update Rating Cleaner
-- Otomatis menghitung ulang rating setelah review baru
-- ===========================================
CREATE OR ALTER PROCEDURE sp_UpdateCleanerRating
    @cleanerId NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Cleaner
    SET rating = (
        SELECT AVG(CAST(rating AS FLOAT))
        FROM Review
        WHERE cleanerId = @cleanerId
    ),
    totalReviews = (
        SELECT COUNT(*)
        FROM Review
        WHERE cleanerId = @cleanerId
    ),
    updatedAt = GETDATE()
    WHERE id = @cleanerId;
END;
GO

-- ===========================================
-- TRIGGER: Auto Update Rating setelah Review
-- ===========================================
CREATE OR ALTER TRIGGER trg_UpdateRatingAfterReview
ON Review
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update rating untuk cleaner yang terkena perubahan
    DECLARE @cleanerId NVARCHAR(450);
    
    -- Dari inserted (INSERT atau UPDATE)
    SELECT @cleanerId = cleanerId FROM inserted;
    IF @cleanerId IS NOT NULL
        EXEC sp_UpdateCleanerRating @cleanerId;
    
    -- Dari deleted (DELETE atau UPDATE)
    SELECT @cleanerId = cleanerId FROM deleted;
    IF @cleanerId IS NOT NULL
        EXEC sp_UpdateCleanerRating @cleanerId;
END;
GO

-- ===========================================
-- INDEXES untuk optimasi performa
-- ===========================================
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);
CREATE INDEX IX_Cleaner_UserId ON Cleaner(userId);
CREATE INDEX IX_Cleaner_Location ON Cleaner(latitude, longitude);
CREATE INDEX IX_Cleaner_Available ON Cleaner(isAvailable);
CREATE INDEX IX_Booking_UserId ON Booking(userId);
CREATE INDEX IX_Booking_CleanerId ON Booking(cleanerId);
CREATE INDEX IX_Booking_Status ON Booking(status);
CREATE INDEX IX_Booking_Date ON Booking(bookingDate);
CREATE INDEX IX_Review_CleanerId ON Review(cleanerId);
GO

-- ===========================================
-- SAMPLE DATA - Services
-- ===========================================
INSERT INTO Service (id, name, description, basePrice, duration, category) VALUES
('SVC001', 'Pembersihan Rumah Standar', 'Pembersihan seluruh ruangan rumah termasuk menyapu, mengepel, dan membersihkan debu', 150000, 120, 'Rumah'),
('SVC002', 'Deep Cleaning', 'Pembersihan mendalam termasuk area sulit dijangkau, furniture, dan sanitasi', 300000, 240, 'Rumah'),
('SVC003', 'Pembersihan Kamar Mandi', 'Pembersihan dan sanitasi kamar mandi secara menyeluruh', 75000, 60, 'Kamar Mandi'),
('SVC004', 'Pembersihan Dapur', 'Pembersihan dapur termasuk kompor, lemari, dan peralatan dapur', 100000, 90, 'Dapur'),
('SVC005', 'Cuci Setrika', 'Layanan mencuci dan menyetrika pakaian', 50000, 120, 'Laundry'),
('SVC006', 'Pembersihan Kantor', 'Pembersihan ruang kantor dan area kerja', 200000, 150, 'Kantor');
GO

-- ===========================================
-- SAMPLE DATA - Users
-- ===========================================
INSERT INTO Users (id, email, password, name, phone, address, latitude, longitude, role) VALUES
('USR001', 'admin@goclean.com', '$2a$10$hashedpassword', 'Admin GoClean', '081234567890', 'Jakarta Pusat', -6.2088, 106.8456, 'admin'),
('USR002', 'cleaner1@goclean.com', '$2a$10$hashedpassword', 'Budi Santoso', '081234567891', 'Jakarta Selatan', -6.2615, 106.8106, 'cleaner'),
('USR003', 'cleaner2@goclean.com', '$2a$10$hashedpassword', 'Siti Aminah', '081234567892', 'Jakarta Barat', -6.1751, 106.7892, 'cleaner'),
('USR004', 'customer1@gmail.com', '$2a$10$hashedpassword', 'John Doe', '081234567893', 'Kemang, Jakarta Selatan', -6.2608, 106.8137, 'customer');
GO

-- ===========================================
-- SAMPLE DATA - Cleaners
-- ===========================================
INSERT INTO Cleaner (id, userId, bio, experience, rating, totalReviews, isAvailable, latitude, longitude, serviceArea) VALUES
('CLN001', 'USR002', 'Berpengalaman 5 tahun dalam pembersihan rumah dan kantor. Teliti dan profesional.', 5, 4.8, 120, 1, -6.2615, 106.8106, 15),
('CLN002', 'USR003', 'Spesialis deep cleaning dan sanitasi. Menggunakan peralatan modern.', 3, 4.5, 85, 1, -6.1751, 106.7892, 10);
GO

-- ===========================================
-- SAMPLE DATA - CleanerService
-- ===========================================
INSERT INTO CleanerService (id, cleanerId, serviceId, customPrice) VALUES
('CS001', 'CLN001', 'SVC001', 160000),
('CS002', 'CLN001', 'SVC002', 320000),
('CS003', 'CLN001', 'SVC004', 110000),
('CS004', 'CLN002', 'SVC002', 310000),
('CS005', 'CLN002', 'SVC003', 80000);
GO

-- ===========================================
-- TEST QUERIES
-- ===========================================

-- Test Haversine Function (Jakarta Pusat ke Jakarta Selatan)
SELECT dbo.fn_Haversine(-6.2088, 106.8456, -6.2615, 106.8106) AS JarakKm;
-- Expected: ~6.8 km

-- Test: Cari cleaner dalam radius 10km dari Jakarta Pusat
EXEC sp_GetNearbyCleaners 
    @customerLat = -6.2088, 
    @customerLon = 106.8456, 
    @radiusKm = 10;

PRINT '===========================================';
PRINT 'Database GoClean berhasil dibuat!';
PRINT 'Tables: Users, Cleaner, Service, CleanerService, Booking, Review';
PRINT 'Functions: fn_Haversine';
PRINT 'Stored Procedures: sp_GetNearbyCleaners, sp_UpdateCleanerRating';
PRINT 'Triggers: trg_UpdateRatingAfterReview';
PRINT '===========================================';
GO
