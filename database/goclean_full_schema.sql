-- ===========================================
-- GoClean Database Schema for SQL Server
-- Synchronized with Prisma Schema
-- Created: December 21, 2025
-- ===========================================

USE goclean;
GO

-- ===========================================
-- TABLES STRUCTURE (Sesuai Prisma Schema)
-- ===========================================

-- 1. USER TABLE
-- Menyimpan data user (USER, TPS, ADMIN)
IF OBJECT_ID('dbo.User', 'U') IS NOT NULL
    SELECT 'User table exists' AS Info;
ELSE
BEGIN
    CREATE TABLE [User] (
        id NVARCHAR(450) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        phone NVARCHAR(50),
        address NVARCHAR(MAX),
        gopayNumber NVARCHAR(50),
        whatsappNumber NVARCHAR(50),
        role NVARCHAR(20) NOT NULL DEFAULT 'USER', -- USER, TPS, ADMIN
        avatar NVARCHAR(MAX),
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 2. TPS PROFILE TABLE
-- Detail profil TPS (Tempat Pembuangan Sampah)
IF OBJECT_ID('dbo.TPSProfile', 'U') IS NOT NULL
    SELECT 'TPSProfile table exists' AS Info;
GO

-- 3. WASTE PRICE TABLE
-- Harga sampah per kg di setiap TPS
IF OBJECT_ID('dbo.WastePrice', 'U') IS NOT NULL
    SELECT 'WastePrice table exists' AS Info;
GO

-- 4. PICKUP REQUEST TABLE
-- Permintaan pickup sampah dari user
IF OBJECT_ID('dbo.PickupRequest', 'U') IS NOT NULL
    SELECT 'PickupRequest table exists' AS Info;
GO

-- 5. WASTE ITEM TABLE
-- Detail item sampah dalam pickup request
IF OBJECT_ID('dbo.WasteItem', 'U') IS NOT NULL
    SELECT 'WasteItem table exists' AS Info;
GO

-- 6. TRANSACTION TABLE
-- Transaksi pembayaran
IF OBJECT_ID('dbo.Transaction', 'U') IS NOT NULL
    SELECT 'Transaction table exists' AS Info;
GO

-- 7. NOTIFICATION TABLE
-- Notifikasi untuk user
IF OBJECT_ID('dbo.Notification', 'U') IS NOT NULL
    SELECT 'Notification table exists' AS Info;
GO

-- ===========================================
-- HAVERSINE FUNCTION
-- Menghitung jarak antar 2 koordinat (lat/lon)
-- ===========================================
CREATE OR ALTER FUNCTION dbo.fn_Haversine (
    @lat1 FLOAT,  -- Latitude titik 1
    @lon1 FLOAT,  -- Longitude titik 1
    @lat2 FLOAT,  -- Latitude titik 2
    @lon2 FLOAT   -- Longitude titik 2
)
RETURNS FLOAT
AS
BEGIN
    DECLARE @R FLOAT = 6371; -- Radius bumi dalam km
    DECLARE @dLat FLOAT = RADIANS(@lat2 - @lat1);
    DECLARE @dLon FLOAT = RADIANS(@lon2 - @lon1);
    DECLARE @a FLOAT;
    DECLARE @c FLOAT;

    -- Haversine Formula
    SET @a = SIN(@dLat / 2) * SIN(@dLat / 2) +
             COS(RADIANS(@lat1)) * COS(RADIANS(@lat2)) *
             SIN(@dLon / 2) * SIN(@dLon / 2);
    
    SET @c = 2 * ATN2(SQRT(@a), SQRT(1 - @a));
    
    RETURN @R * @c;
END;
GO

-- ===========================================
-- STORED PROCEDURE: Cari TPS Terdekat
-- ===========================================
CREATE OR ALTER PROCEDURE sp_GetNearbyTPS
    @userLat FLOAT,
    @userLon FLOAT,
    @radiusKm FLOAT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.id,
        t.tpsName,
        t.address,
        t.phone,
        t.latitude,
        t.longitude,
        t.operatingHours,
        t.isActive,
        u.name AS ownerName,
        u.email,
        dbo.fn_Haversine(@userLat, @userLon, t.latitude, t.longitude) AS distanceKm
    FROM TPSProfile t
    INNER JOIN [User] u ON t.userId = u.id
    WHERE t.isActive = 1
      AND t.latitude IS NOT NULL
      AND t.longitude IS NOT NULL
      AND dbo.fn_Haversine(@userLat, @userLon, t.latitude, t.longitude) <= @radiusKm
    ORDER BY distanceKm ASC;
END;
GO

-- ===========================================
-- STORED PROCEDURE: Get Pickup Statistics
-- ===========================================
CREATE OR ALTER PROCEDURE sp_GetPickupStatistics
    @userId NVARCHAR(450) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        status,
        COUNT(*) AS totalCount,
        SUM(CASE WHEN userId = @userId THEN 1 ELSE 0 END) AS userCount
    FROM PickupRequest
    GROUP BY status;
END;
GO

-- ===========================================
-- STORED PROCEDURE: Get Transaction Summary
-- ===========================================
CREATE OR ALTER PROCEDURE sp_GetTransactionSummary
    @userId NVARCHAR(450) = NULL,
    @startDate DATE = NULL,
    @endDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COALESCE(SUM(totalWeight), 0) AS totalWeight,
        COALESCE(SUM(totalPrice), 0) AS totalEarnings,
        COUNT(*) AS totalTransactions,
        SUM(CASE WHEN isPaid = 1 THEN 1 ELSE 0 END) AS paidTransactions
    FROM [Transaction]
    WHERE (@userId IS NULL OR userId = @userId)
      AND (@startDate IS NULL OR CAST(createdAt AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST(createdAt AS DATE) <= @endDate);
END;
GO

-- ===========================================
-- VIEW: Dashboard Statistics
-- ===========================================
CREATE OR ALTER VIEW vw_DashboardStats AS
SELECT
    (SELECT COUNT(*) FROM [User] WHERE role = 'USER') AS totalUsers,
    (SELECT COUNT(*) FROM [User] WHERE role = 'TPS') AS totalTPS,
    (SELECT COUNT(*) FROM PickupRequest) AS totalPickups,
    (SELECT COUNT(*) FROM PickupRequest WHERE status = 'PENDING') AS pendingPickups,
    (SELECT COUNT(*) FROM PickupRequest WHERE status = 'COMPLETED') AS completedPickups,
    (SELECT COALESCE(SUM(totalWeight), 0) FROM [Transaction]) AS totalWasteCollected,
    (SELECT COALESCE(SUM(totalPrice), 0) FROM [Transaction]) AS totalRevenue;
GO

-- ===========================================
-- VIEW: TPS dengan Jarak (untuk testing)
-- ===========================================
CREATE OR ALTER VIEW vw_TPSWithDistance AS
SELECT 
    t.id,
    t.tpsName,
    t.address,
    t.latitude,
    t.longitude,
    t.isActive,
    u.name AS ownerName,
    u.email
FROM TPSProfile t
INNER JOIN [User] u ON t.userId = u.id
WHERE t.isActive = 1;
GO

-- ===========================================
-- TRIGGER: Update timestamp on User update
-- ===========================================
CREATE OR ALTER TRIGGER trg_User_UpdateTimestamp
ON [User]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [User]
    SET updatedAt = GETDATE()
    FROM [User] u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- ===========================================
-- TRIGGER: Update timestamp on PickupRequest
-- ===========================================
CREATE OR ALTER TRIGGER trg_PickupRequest_UpdateTimestamp
ON PickupRequest
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE PickupRequest
    SET updatedAt = GETDATE()
    FROM PickupRequest p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO

-- ===========================================
-- TEST QUERIES
-- ===========================================

-- Test Haversine (Jakarta Pusat ke Bandung)
SELECT dbo.fn_Haversine(-6.2088, 106.8456, -6.9175, 107.6191) AS 'Jakarta-Bandung (km)';
-- Expected: ~118 km

-- View dashboard stats
SELECT * FROM vw_DashboardStats;

PRINT '===========================================';
PRINT 'GoClean SQL Schema Extended berhasil!';
PRINT 'Functions: fn_Haversine';
PRINT 'Stored Procedures: sp_GetNearbyTPS, sp_GetPickupStatistics, sp_GetTransactionSummary';
PRINT 'Views: vw_DashboardStats, vw_TPSWithDistance';
PRINT 'Triggers: trg_User_UpdateTimestamp, trg_PickupRequest_UpdateTimestamp';
PRINT '===========================================';
GO
