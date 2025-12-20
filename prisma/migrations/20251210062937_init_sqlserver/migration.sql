BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [address] NVARCHAR(1000),
    [gopayNumber] NVARCHAR(1000),
    [whatsappNumber] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [avatar] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[TPSProfile] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [tpsName] NVARCHAR(1000) NOT NULL,
    [latitude] FLOAT(53),
    [longitude] FLOAT(53),
    [address] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [gopayNumber] NVARCHAR(1000),
    [whatsappNumber] NVARCHAR(1000),
    [operatingHours] NVARCHAR(1000),
    [capacity] INT,
    [description] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [TPSProfile_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TPSProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TPSProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TPSProfile_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[WastePrice] (
    [id] NVARCHAR(1000) NOT NULL,
    [tpsProfileId] NVARCHAR(1000) NOT NULL,
    [wasteType] NVARCHAR(1000) NOT NULL,
    [pricePerKg] FLOAT(53) NOT NULL,
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WastePrice_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [WastePrice_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [WastePrice_tpsProfileId_wasteType_key] UNIQUE NONCLUSTERED ([tpsProfileId],[wasteType])
);

-- CreateTable
CREATE TABLE [dbo].[PickupRequest] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [tpsId] NVARCHAR(1000),
    [latitude] FLOAT(53) NOT NULL,
    [longitude] FLOAT(53) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PickupRequest_status_df] DEFAULT 'PENDING',
    [scheduledAt] DATETIME2,
    [pickedUpAt] DATETIME2,
    [photos] NVARCHAR(1000) NOT NULL CONSTRAINT [PickupRequest_photos_df] DEFAULT '[]',
    [videos] NVARCHAR(1000) NOT NULL CONSTRAINT [PickupRequest_videos_df] DEFAULT '[]',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PickupRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PickupRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[WasteItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [pickupRequestId] NVARCHAR(1000) NOT NULL,
    [wasteType] NVARCHAR(1000) NOT NULL,
    [estimatedWeight] FLOAT(53),
    [actualWeight] FLOAT(53),
    [price] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [WasteItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [WasteItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Transaction] (
    [id] NVARCHAR(1000) NOT NULL,
    [pickupRequestId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [totalWeight] FLOAT(53) NOT NULL,
    [totalPrice] FLOAT(53) NOT NULL,
    [isPaid] BIT NOT NULL CONSTRAINT [Transaction_isPaid_df] DEFAULT 0,
    [paidAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Transaction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Transaction_pickupRequestId_key] UNIQUE NONCLUSTERED ([pickupRequestId])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    [type] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[TPSProfile] ADD CONSTRAINT [TPSProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[WastePrice] ADD CONSTRAINT [WastePrice_tpsProfileId_fkey] FOREIGN KEY ([tpsProfileId]) REFERENCES [dbo].[TPSProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PickupRequest] ADD CONSTRAINT [PickupRequest_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PickupRequest] ADD CONSTRAINT [PickupRequest_tpsId_fkey] FOREIGN KEY ([tpsId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[WasteItem] ADD CONSTRAINT [WasteItem_pickupRequestId_fkey] FOREIGN KEY ([pickupRequestId]) REFERENCES [dbo].[PickupRequest]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_pickupRequestId_fkey] FOREIGN KEY ([pickupRequestId]) REFERENCES [dbo].[PickupRequest]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
