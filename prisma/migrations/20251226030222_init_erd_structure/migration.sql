BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Akun] (
    [IDAkun] NVARCHAR(1000) NOT NULL,
    [Email] NVARCHAR(1000) NOT NULL,
    [Password] NVARCHAR(1000) NOT NULL,
    [Role] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Akun_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Akun_pkey] PRIMARY KEY CLUSTERED ([IDAkun]),
    CONSTRAINT [Akun_Email_key] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [IDUser] NVARCHAR(1000) NOT NULL,
    [IDAkun] NVARCHAR(1000) NOT NULL,
    [Nama] NVARCHAR(1000) NOT NULL,
    [Alamat] NVARCHAR(1000),
    [NoTelp] NVARCHAR(1000),
    [IDKecamatan] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([IDUser]),
    CONSTRAINT [User_IDAkun_key] UNIQUE NONCLUSTERED ([IDAkun])
);

-- CreateTable
CREATE TABLE [dbo].[ProfileTps] (
    [IDTps] NVARCHAR(1000) NOT NULL,
    [IDAkun] NVARCHAR(1000) NOT NULL,
    [NamaTps] NVARCHAR(1000) NOT NULL,
    [Alamat] NVARCHAR(1000) NOT NULL,
    [Longitude] FLOAT(53) NOT NULL,
    [Latitude] FLOAT(53) NOT NULL,
    [JamOperasional] NVARCHAR(1000),
    [IDKecamatan] NVARCHAR(1000),
    [Foto] NVARCHAR(1000),
    [NoTelp] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ProfileTps_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ProfileTps_pkey] PRIMARY KEY CLUSTERED ([IDTps]),
    CONSTRAINT [ProfileTps_IDAkun_key] UNIQUE NONCLUSTERED ([IDAkun])
);

-- CreateTable
CREATE TABLE [dbo].[Transaksi] (
    [IDTransaksi] NVARCHAR(1000) NOT NULL,
    [IDUser] NVARCHAR(1000) NOT NULL,
    [IDTps] NVARCHAR(1000),
    [TanggalTransaksi] DATETIME2 NOT NULL CONSTRAINT [Transaksi_TanggalTransaksi_df] DEFAULT CURRENT_TIMESTAMP,
    [JamTransaksi] NVARCHAR(1000),
    [StatusTransaksi] NVARCHAR(1000) NOT NULL CONSTRAINT [Transaksi_StatusTransaksi_df] DEFAULT 'PENDING',
    [AlamatJemput] NVARCHAR(1000) NOT NULL,
    [Longitude] FLOAT(53) NOT NULL,
    [Latitude] FLOAT(53) NOT NULL,
    [Type] NVARCHAR(1000),
    [ScheduledAt] DATETIME2,
    [CompletedAt] DATETIME2,
    [Description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaksi_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Transaksi_pkey] PRIMARY KEY CLUSTERED ([IDTransaksi])
);

-- CreateTable
CREATE TABLE [dbo].[DetailSampah] (
    [IDDetail] NVARCHAR(1000) NOT NULL,
    [IDTransaksi] NVARCHAR(1000) NOT NULL,
    [IDKategori] NVARCHAR(1000) NOT NULL,
    [Berat] FLOAT(53) NOT NULL,
    [EstimatedWeight] FLOAT(53),
    [ActualWeight] FLOAT(53),
    [Price] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DetailSampah_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [DetailSampah_pkey] PRIMARY KEY CLUSTERED ([IDDetail])
);

-- CreateTable
CREATE TABLE [dbo].[KategoriSampah] (
    [IDKategori] NVARCHAR(1000) NOT NULL,
    [JenisSampah] NVARCHAR(1000) NOT NULL,
    [Deskripsi] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [KategoriSampah_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [KategoriSampah_pkey] PRIMARY KEY CLUSTERED ([IDKategori]),
    CONSTRAINT [KategoriSampah_JenisSampah_key] UNIQUE NONCLUSTERED ([JenisSampah])
);

-- CreateTable
CREATE TABLE [dbo].[Kecamatan] (
    [IDKecamatan] NVARCHAR(1000) NOT NULL,
    [NamaKecamatan] NVARCHAR(1000) NOT NULL,
    [KodeKecamatan] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kecamatan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kecamatan_pkey] PRIMARY KEY CLUSTERED ([IDKecamatan])
);

-- CreateTable
CREATE TABLE [dbo].[Kategori] (
    [IDKategori] NVARCHAR(1000) NOT NULL,
    [NamaKategori] NVARCHAR(1000) NOT NULL,
    [Deskripsi] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kategori_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kategori_pkey] PRIMARY KEY CLUSTERED ([IDKategori])
);

-- CreateTable
CREATE TABLE [dbo].[ObjekPoint] (
    [PointID] NVARCHAR(1000) NOT NULL,
    [NamaObjek] NVARCHAR(1000) NOT NULL,
    [KategoriID] NVARCHAR(1000) NOT NULL,
    [Latitude] FLOAT(53) NOT NULL,
    [Longitude] FLOAT(53) NOT NULL,
    [Deskripsi] NVARCHAR(1000),
    [KecamatanID] NVARCHAR(1000) NOT NULL,
    [IDTps] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ObjekPoint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ObjekPoint_pkey] PRIMARY KEY CLUSTERED ([PointID])
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
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_IDAkun_fkey] FOREIGN KEY ([IDAkun]) REFERENCES [dbo].[Akun]([IDAkun]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_IDKecamatan_fkey] FOREIGN KEY ([IDKecamatan]) REFERENCES [dbo].[Kecamatan]([IDKecamatan]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ProfileTps] ADD CONSTRAINT [ProfileTps_IDAkun_fkey] FOREIGN KEY ([IDAkun]) REFERENCES [dbo].[Akun]([IDAkun]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ProfileTps] ADD CONSTRAINT [ProfileTps_IDKecamatan_fkey] FOREIGN KEY ([IDKecamatan]) REFERENCES [dbo].[Kecamatan]([IDKecamatan]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Transaksi] ADD CONSTRAINT [Transaksi_IDUser_fkey] FOREIGN KEY ([IDUser]) REFERENCES [dbo].[User]([IDUser]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transaksi] ADD CONSTRAINT [Transaksi_IDTps_fkey] FOREIGN KEY ([IDTps]) REFERENCES [dbo].[ProfileTps]([IDTps]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DetailSampah] ADD CONSTRAINT [DetailSampah_IDTransaksi_fkey] FOREIGN KEY ([IDTransaksi]) REFERENCES [dbo].[Transaksi]([IDTransaksi]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DetailSampah] ADD CONSTRAINT [DetailSampah_IDKategori_fkey] FOREIGN KEY ([IDKategori]) REFERENCES [dbo].[KategoriSampah]([IDKategori]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ObjekPoint] ADD CONSTRAINT [ObjekPoint_KategoriID_fkey] FOREIGN KEY ([KategoriID]) REFERENCES [dbo].[Kategori]([IDKategori]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ObjekPoint] ADD CONSTRAINT [ObjekPoint_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([IDKecamatan]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ObjekPoint] ADD CONSTRAINT [ObjekPoint_IDTps_fkey] FOREIGN KEY ([IDTps]) REFERENCES [dbo].[ProfileTps]([IDTps]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Area] ADD CONSTRAINT [Area_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([IDKecamatan]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
