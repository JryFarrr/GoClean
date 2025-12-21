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
