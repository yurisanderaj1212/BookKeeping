-- Script para crear las tablas faltantes en BookKeepingDB
-- Ejecutar este script si faltan las tablas Categories, Accounts y Transactions

USE BookKeepingDB;
GO

-- Crear tabla Categories
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories] (
        [Id] int NOT NULL IDENTITY(1,1),
        [Name] nvarchar(100) NOT NULL,
        [Type] int NOT NULL,
        [UserId] int NOT NULL,
        [IsActive] bit NOT NULL DEFAULT 1,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Categories_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
    
    CREATE UNIQUE INDEX [IX_Categories_UserId_Name_Type] ON [Categories] ([UserId], [Name], [Type]);
    
    PRINT 'Tabla Categories creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Categories ya existe';
END
GO

-- Crear tabla Accounts
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Accounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Accounts] (
        [Id] int NOT NULL IDENTITY(1,1),
        [Name] nvarchar(200) NOT NULL,
        [Code] nvarchar(50) NOT NULL,
        [Type] int NOT NULL,
        [SubType] int NOT NULL,
        [UserId] int NOT NULL,
        [InitialBalance] decimal(18,2) NOT NULL DEFAULT 0,
        [CurrentBalance] decimal(18,2) NOT NULL DEFAULT 0,
        [Description] nvarchar(500) NULL,
        [Currency] nvarchar(10) NOT NULL DEFAULT 'USD',
        [IsActive] bit NOT NULL DEFAULT 1,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Accounts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Accounts_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [IX_Accounts_UserId] ON [Accounts] ([UserId]);
    
    PRINT 'Tabla Accounts creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Accounts ya existe';
END
GO

-- Crear tabla Transactions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Transactions] (
        [Id] int NOT NULL IDENTITY(1,1),
        [Type] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [CategoryId] int NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Date] datetime2 NOT NULL,
        [UserId] int NOT NULL,
        [AccountId] int NOT NULL,
        [DebitAccountId] int NULL,
        [CreditAccountId] int NULL,
        [DebitAmount] decimal(18,2) NOT NULL DEFAULT 0,
        [CreditAmount] decimal(18,2) NOT NULL DEFAULT 0,
        [Notes] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Transactions_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Transactions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]),
        CONSTRAINT [FK_Transactions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]),
        CONSTRAINT [FK_Transactions_DebitAccounts] FOREIGN KEY ([DebitAccountId]) REFERENCES [Accounts]([Id]),
        CONSTRAINT [FK_Transactions_CreditAccounts] FOREIGN KEY ([CreditAccountId]) REFERENCES [Accounts]([Id])
    );
    
    CREATE INDEX [IX_Transactions_UserId] ON [Transactions] ([UserId]);
    CREATE INDEX [IX_Transactions_CategoryId] ON [Transactions] ([CategoryId]);
    CREATE INDEX [IX_Transactions_AccountId] ON [Transactions] ([AccountId]);
    CREATE INDEX [IX_Transactions_Date] ON [Transactions] ([Date]);
    
    PRINT 'Tabla Transactions creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Transactions ya existe';
END
GO

-- Insertar categorías por defecto para el primer usuario (si existe)
DECLARE @UserId int;
SELECT TOP 1 @UserId = Id FROM Users ORDER BY Id;

IF @UserId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Categories WHERE UserId = @UserId)
BEGIN
    -- Categorías de Ingresos (Type = 0)
    INSERT INTO Categories (Name, Type, UserId, IsActive, CreatedAt) VALUES
    ('Ventas', 0, @UserId, 1, GETDATE()),
    ('Servicios', 0, @UserId, 1, GETDATE()),
    ('Consultoría', 0, @UserId, 1, GETDATE()),
    ('Inversiones', 0, @UserId, 1, GETDATE()),
    ('Otros Ingresos', 0, @UserId, 1, GETDATE());
    
    -- Categorías de Gastos (Type = 1)
    INSERT INTO Categories (Name, Type, UserId, IsActive, CreatedAt) VALUES
    ('Oficina', 1, @UserId, 1, GETDATE()),
    ('Marketing', 1, @UserId, 1, GETDATE()),
    ('Software', 1, @UserId, 1, GETDATE()),
    ('Servicios Públicos', 1, @UserId, 1, GETDATE()),
    ('Equipos', 1, @UserId, 1, GETDATE()),
    ('Viajes', 1, @UserId, 1, GETDATE()),
    ('Servicios Profesionales', 1, @UserId, 1, GETDATE()),
    ('Alquiler', 1, @UserId, 1, GETDATE()),
    ('Otros Gastos', 1, @UserId, 1, GETDATE());
    
    PRINT 'Categorías por defecto insertadas exitosamente';
END
ELSE
BEGIN
    PRINT 'Las categorías ya existen o no hay usuarios';
END
GO

-- Crear cuenta por defecto para el primer usuario (si existe y no tiene cuentas)
DECLARE @UserId int;
SELECT TOP 1 @UserId = Id FROM Users ORDER BY Id;

IF @UserId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Accounts WHERE UserId = @UserId)
BEGIN
    INSERT INTO Accounts (Name, Code, Type, SubType, UserId, InitialBalance, CurrentBalance, Description, Currency, IsActive, CreatedAt)
    VALUES ('Cuenta Principal', '1000', 0, 0, @UserId, 0, 0, 'Cuenta principal de operaciones', 'USD', 1, GETDATE());
    
    PRINT 'Cuenta por defecto creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Las cuentas ya existen o no hay usuarios';
END
GO

PRINT 'Script completado exitosamente';
