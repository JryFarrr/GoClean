BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PickupRequest] ADD [driverId] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[DriverLocations] (
    [id] NVARCHAR(1000) NOT NULL,
    [pickupRequestId] NVARCHAR(1000) NOT NULL,
    [latitude] FLOAT(53) NOT NULL,
    [longitude] FLOAT(53) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [DriverLocations_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DriverLocations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DriverLocations_pickupRequestId_key] UNIQUE NONCLUSTERED ([pickupRequestId])
);

-- CreateTable
CREATE TABLE [dbo].[TPSLocations] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [kecamatan] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [latitude] FLOAT(53) NOT NULL,
    [longitude] FLOAT(53) NOT NULL,
    [operatingHours] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [TPSLocations_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TPSLocations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TPSLocations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Kategori] (
    [id] NVARCHAR(1000) NOT NULL,
    [namaKategori] NVARCHAR(1000) NOT NULL,
    [deskripsi] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kategori_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kategori_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Kecamatan] (
    [id] NVARCHAR(1000) NOT NULL,
    [namaKecamatan] NVARCHAR(1000) NOT NULL,
    [kodeKecamatan] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kecamatan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kecamatan_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[objekPoint] (
    [PointID] NVARCHAR(1000) NOT NULL,
    [NamaObjek] NVARCHAR(1000) NOT NULL,
    [KategoriID] NVARCHAR(1000) NOT NULL,
    [Latitude] FLOAT(53) NOT NULL,
    [Longitude] FLOAT(53) NOT NULL,
    [Deskripsi] NVARCHAR(1000),
    [KecamatanID] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [objekPoint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [objekPoint_pkey] PRIMARY KEY CLUSTERED ([PointID])
);

-- CreateTable
CREATE TABLE [dbo].[Jalan] (
    [JalanID] NVARCHAR(1000) NOT NULL,
    [NamaJalan] NVARCHAR(1000) NOT NULL,
    [KoordinatJSON] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Jalan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Jalan_pkey] PRIMARY KEY CLUSTERED ([JalanID])
);

-- CreateTable
CREATE TABLE [dbo].[Area] (
    [AreaID] NVARCHAR(1000) NOT NULL,
    [NamaArea] NVARCHAR(1000) NOT NULL,
    [PolygonJSON] NVARCHAR(max) NOT NULL,
    [KecamatanID] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Area_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Area_pkey] PRIMARY KEY CLUSTERED ([AreaID])
);

-- AddForeignKey
ALTER TABLE [dbo].[PickupRequest] ADD CONSTRAINT [PickupRequest_driverId_fkey] FOREIGN KEY ([driverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DriverLocations] ADD CONSTRAINT [DriverLocations_pickupRequestId_fkey] FOREIGN KEY ([pickupRequestId]) REFERENCES [dbo].[PickupRequest]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[objekPoint] ADD CONSTRAINT [objekPoint_KategoriID_fkey] FOREIGN KEY ([KategoriID]) REFERENCES [dbo].[Kategori]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[objekPoint] ADD CONSTRAINT [objekPoint_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Area] ADD CONSTRAINT [Area_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
