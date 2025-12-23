BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Users_id_df] DEFAULT newid(),
    [FullName] NVARCHAR(150) NOT NULL,
    [email] NVARCHAR(150) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(20) NOT NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [Users_IsActive_df] DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Users_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Shipments] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Shipments_id_df] DEFAULT newid(),
    [ShipmentCode] NVARCHAR(50) NOT NULL,
    [EVGCode] NVARCHAR(50) NOT NULL,
    [BillOfLading] NVARCHAR(100),
    [ContainerNumber] NVARCHAR(100),
    [ClientId] UNIQUEIDENTIFIER NOT NULL,
    [AssignedStaffId] UNIQUEIDENTIFIER,
    [Description] NVARCHAR(255),
    [OriginCity] NVARCHAR(100),
    [OriginCountry] NVARCHAR(100),
    [DestinationCity] NVARCHAR(100),
    [DestinationCountry] NVARCHAR(100),
    [TransportMode] NVARCHAR(30),
    [Status] NVARCHAR(30) NOT NULL,
    [ProgressPercent] INT NOT NULL CONSTRAINT [Shipments_ProgressPercent_df] DEFAULT 0,
    [EstimatedDeliveryDate] DATE,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Shipments_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2,
    CONSTRAINT [Shipments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Shipments_EVGCode_key] UNIQUE NONCLUSTERED ([EVGCode])
);

-- CreateTable
CREATE TABLE [dbo].[ShipmentEvents] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [ShipmentEvents_id_df] DEFAULT newid(),
    [ShipmentId] UNIQUEIDENTIFIER NOT NULL,
    [EventTitle] NVARCHAR(150),
    [EventLocation] NVARCHAR(150),
    [EventDate] DATETIME2,
    [Status] NVARCHAR(30),
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ShipmentEvents_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ShipmentEvents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Invoices] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Invoices_id_df] DEFAULT newid(),
    [InvoiceCode] NVARCHAR(50) NOT NULL,
    [ShipmentId] UNIQUEIDENTIFIER NOT NULL,
    [Amount] DECIMAL(18,2),
    [Currency] NVARCHAR(10) NOT NULL CONSTRAINT [Invoices_Currency_df] DEFAULT 'USD',
    [Status] NVARCHAR(20) NOT NULL,
    [InvoiceUrl] NVARCHAR(500),
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Invoices_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Invoices_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Invoices_InvoiceCode_key] UNIQUE NONCLUSTERED ([InvoiceCode])
);

-- CreateTable
CREATE TABLE [dbo].[GalleryItems] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [GalleryItems_id_df] DEFAULT newid(),
    [Title] NVARCHAR(255) NOT NULL,
    [Category] NVARCHAR(50) NOT NULL,
    [Description] NTEXT,
    [MediaType] NVARCHAR(10) NOT NULL,
    [MediaUrl] NVARCHAR(500) NOT NULL,
    [ThumbnailUrl] NVARCHAR(500),
    [CreatedByUserId] UNIQUEIDENTIFIER NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [GalleryItems_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [GalleryItems_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notifications] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Notifications_id_df] DEFAULT newid(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Message] NVARCHAR(255),
    [IsRead] BIT NOT NULL CONSTRAINT [Notifications_IsRead_df] DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Notifications_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MediaUploads] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [MediaUploads_id_df] DEFAULT newid(),
    [UploadedBy] UNIQUEIDENTIFIER,
    [MediaUrl] NVARCHAR(500),
    [MediaType] NVARCHAR(10),
    [CloudinaryPublicId] NVARCHAR(255),
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [MediaUploads_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MediaUploads_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Otps] (
    [id] UNIQUEIDENTIFIER NOT NULL CONSTRAINT [Otps_id_df] DEFAULT newid(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [OtpCode] NVARCHAR(10) NOT NULL,
    [ExpiresAt] DATETIME2 NOT NULL,
    [IsUsed] BIT NOT NULL CONSTRAINT [Otps_IsUsed_df] DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Otps_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Otps_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Shipments] ADD CONSTRAINT [Shipments_ClientId_fkey] FOREIGN KEY ([ClientId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Shipments] ADD CONSTRAINT [Shipments_AssignedStaffId_fkey] FOREIGN KEY ([AssignedStaffId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ShipmentEvents] ADD CONSTRAINT [ShipmentEvents_ShipmentId_fkey] FOREIGN KEY ([ShipmentId]) REFERENCES [dbo].[Shipments]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoices] ADD CONSTRAINT [Invoices_ShipmentId_fkey] FOREIGN KEY ([ShipmentId]) REFERENCES [dbo].[Shipments]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[GalleryItems] ADD CONSTRAINT [GalleryItems_CreatedByUserId_fkey] FOREIGN KEY ([CreatedByUserId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [Notifications_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MediaUploads] ADD CONSTRAINT [MediaUploads_UploadedBy_fkey] FOREIGN KEY ([UploadedBy]) REFERENCES [dbo].[Users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Otps] ADD CONSTRAINT [Otps_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH