-- CreateTable: Kategori
CREATE TABLE [dbo].[Kategori] (
    [id] NVARCHAR(30) NOT NULL,
    [namaKategori] NVARCHAR(1000) NOT NULL,
    [deskripsi] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kategori_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kategori_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable: Kecamatan
CREATE TABLE [dbo].[Kecamatan] (
    [id] NVARCHAR(30) NOT NULL,
    [namaKecamatan] NVARCHAR(1000) NOT NULL,
    [kodeKecamatan] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Kecamatan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Kecamatan_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable: objekPoint (Layer Point)
CREATE TABLE [dbo].[objekPoint] (
    [PointID] NVARCHAR(30) NOT NULL,
    [NamaObjek] NVARCHAR(1000) NOT NULL,
    [KategoriID] NVARCHAR(30) NOT NULL,
    [Latitude] FLOAT(53) NOT NULL,
    [Longitude] FLOAT(53) NOT NULL,
    [Deskripsi] NVARCHAR(1000),
    [KecamatanID] NVARCHAR(30) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [objekPoint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [objekPoint_pkey] PRIMARY KEY CLUSTERED ([PointID])
);

-- CreateTable: Jalan (Layer Line)
CREATE TABLE [dbo].[Jalan] (
    [JalanID] NVARCHAR(30) NOT NULL,
    [NamaJalan] NVARCHAR(1000) NOT NULL,
    [KoordinatJSON] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Jalan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Jalan_pkey] PRIMARY KEY CLUSTERED ([JalanID])
);

-- CreateTable: Area (Layer Polygon)
CREATE TABLE [dbo].[Area] (
    [AreaID] NVARCHAR(30) NOT NULL,
    [NamaArea] NVARCHAR(1000) NOT NULL,
    [PolygonJSON] NVARCHAR(MAX) NOT NULL,
    [KecamatanID] NVARCHAR(30),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Area_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Area_pkey] PRIMARY KEY CLUSTERED ([AreaID])
);

-- AddForeignKey
ALTER TABLE [dbo].[objekPoint] ADD CONSTRAINT [objekPoint_KategoriID_fkey] FOREIGN KEY ([KategoriID]) REFERENCES [dbo].[Kategori]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[objekPoint] ADD CONSTRAINT [objekPoint_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Area] ADD CONSTRAINT [Area_KecamatanID_fkey] FOREIGN KEY ([KecamatanID]) REFERENCES [dbo].[Kecamatan]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create Indexes for better performance
CREATE INDEX [objekPoint_KategoriID_idx] ON [dbo].[objekPoint]([KategoriID]);
CREATE INDEX [objekPoint_KecamatanID_idx] ON [dbo].[objekPoint]([KecamatanID]);
CREATE INDEX [objekPoint_Latitude_Longitude_idx] ON [dbo].[objekPoint]([Latitude], [Longitude]);
CREATE INDEX [Area_KecamatanID_idx] ON [dbo].[Area]([KecamatanID]);
