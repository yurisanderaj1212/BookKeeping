-- Script para agregar columna UpdatedAt a la tabla Accounts
-- Fecha: 21 de Febrero de 2026
-- Problema: El modelo C# tiene UpdatedAt pero la tabla en BD no

USE [BookKeeping]
GO

-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Accounts]') 
    AND name = 'UpdatedAt'
)
BEGIN
    -- Agregar columna UpdatedAt con valor por defecto
    ALTER TABLE [dbo].[Accounts]
    ADD [UpdatedAt] datetime2(7) NOT NULL 
    DEFAULT GETUTCDATE()
    
    PRINT '✅ Columna UpdatedAt agregada exitosamente a la tabla Accounts'
END
ELSE
BEGIN
    PRINT '⚠️ La columna UpdatedAt ya existe en la tabla Accounts'
END
GO

-- Actualizar todas las filas existentes para que UpdatedAt = CreatedAt
UPDATE [dbo].[Accounts]
SET [UpdatedAt] = [CreatedAt]
WHERE [UpdatedAt] IS NULL OR [UpdatedAt] = '0001-01-01'
GO

PRINT '✅ Script completado exitosamente'
GO
