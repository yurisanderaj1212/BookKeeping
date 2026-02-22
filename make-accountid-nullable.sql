-- Script para hacer AccountId nullable en la tabla Transactions
-- Fecha: 22 de febrero de 2026

USE [BookKeepingDB];
GO

-- Verificar si la columna existe y no es nullable
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Transactions' 
    AND COLUMN_NAME = 'AccountId' 
    AND IS_NULLABLE = 'NO'
)
BEGIN
    PRINT 'Haciendo AccountId nullable en Transactions...';
    
    -- Primero, eliminar la foreign key constraint si existe
    IF EXISTS (
        SELECT 1 
        FROM sys.foreign_keys 
        WHERE name = 'FK_Transactions_Accounts_AccountId'
    )
    BEGIN
        PRINT 'Eliminando foreign key constraint...';
        ALTER TABLE [Transactions] DROP CONSTRAINT [FK_Transactions_Accounts_AccountId];
    END
    
    -- Hacer la columna nullable
    PRINT 'Modificando columna AccountId...';
    ALTER TABLE [Transactions] ALTER COLUMN [AccountId] INT NULL;
    
    -- Recrear la foreign key constraint
    PRINT 'Recreando foreign key constraint...';
    ALTER TABLE [Transactions]
    ADD CONSTRAINT [FK_Transactions_Accounts_AccountId]
    FOREIGN KEY ([AccountId]) REFERENCES [Accounts]([Id]);
    
    PRINT 'AccountId ahora es nullable en Transactions.';
END
ELSE
BEGIN
    PRINT 'AccountId ya es nullable o no existe en Transactions.';
END
GO

-- Verificar el cambio
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Transactions' AND COLUMN_NAME = 'AccountId';
GO
