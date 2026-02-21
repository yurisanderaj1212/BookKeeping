-- ============================================================================
-- Script: Actualizar tabla Categories manualmente
-- Proyecto: BookKeeping
-- Fecha: 21 de Febrero de 2026
-- Descripción: Actualiza la estructura de Categories para sistema global
-- ============================================================================

USE BookKeepingDB;
GO

PRINT '========================================';
PRINT 'Actualizando estructura de Categories';
PRINT '========================================';
PRINT '';

-- ============================================================================
-- Paso 1: Eliminar transacciones existentes (por FK constraint)
-- ============================================================================
PRINT 'Paso 1: Eliminando transacciones existentes...';
DELETE FROM Transactions;
DECLARE @TransCount INT = @@ROWCOUNT;
PRINT 'Transacciones eliminadas: ' + CAST(@TransCount AS VARCHAR(10));
PRINT '';
GO

-- ============================================================================
-- Paso 2: Agregar nuevas columnas a Categories
-- ============================================================================
PRINT 'Paso 2: Agregando nuevas columnas...';

-- Agregar IsSystemDefault
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'IsSystemDefault')
BEGIN
    ALTER TABLE Categories ADD IsSystemDefault BIT NOT NULL DEFAULT 0;
    PRINT 'Columna IsSystemDefault agregada';
END
ELSE
BEGIN
    PRINT 'Columna IsSystemDefault ya existe';
END

-- Agregar DisplayOrder
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'DisplayOrder')
BEGIN
    ALTER TABLE Categories ADD DisplayOrder INT NOT NULL DEFAULT 0;
    PRINT 'Columna DisplayOrder agregada';
END
ELSE
BEGIN
    PRINT 'Columna DisplayOrder ya existe';
END

-- Agregar UpdatedAt
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'UpdatedAt')
BEGIN
    ALTER TABLE Categories ADD UpdatedAt DATETIME2 NULL;
    PRINT 'Columna UpdatedAt agregada';
END
ELSE
BEGIN
    PRINT 'Columna UpdatedAt ya existe';
END

PRINT '';
GO

-- ============================================================================
-- Paso 3: Eliminar índice único anterior (con UserId)
-- ============================================================================
PRINT 'Paso 3: Eliminando índice único anterior...';

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_UserId_Name_Type')
BEGIN
    DROP INDEX IX_Categories_UserId_Name_Type ON Categories;
    PRINT 'Índice IX_Categories_UserId_Name_Type eliminado';
END
ELSE
BEGIN
    PRINT 'Índice IX_Categories_UserId_Name_Type no existe';
END

PRINT '';
GO

-- ============================================================================
-- Paso 4: Eliminar columna UserId
-- ============================================================================
PRINT 'Paso 4: Eliminando columna UserId...';

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'UserId')
BEGIN
    ALTER TABLE Categories DROP COLUMN UserId;
    PRINT 'Columna UserId eliminada';
END
ELSE
BEGIN
    PRINT 'Columna UserId ya no existe';
END

PRINT '';
GO

-- ============================================================================
-- Paso 5: Crear nuevo índice único (sin UserId)
-- ============================================================================
PRINT 'Paso 5: Creando nuevo índice único...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_Name_Type')
BEGIN
    CREATE UNIQUE INDEX IX_Categories_Name_Type ON Categories (Name, Type);
    PRINT 'Índice IX_Categories_Name_Type creado';
END
ELSE
BEGIN
    PRINT 'Índice IX_Categories_Name_Type ya existe';
END

PRINT '';
GO

-- ============================================================================
-- Paso 6: Limpiar categorías existentes
-- ============================================================================
PRINT 'Paso 6: Limpiando categorías existentes...';
DELETE FROM Categories;
DECLARE @CatCount INT = @@ROWCOUNT;
PRINT 'Categorías eliminadas: ' + CAST(@CatCount AS VARCHAR(10));
PRINT '';
GO

-- ============================================================================
-- Paso 7: Resetear Identity
-- ============================================================================
PRINT 'Paso 7: Reseteando Identity de Categories...';
DBCC CHECKIDENT ('Categories', RESEED, 0);
PRINT 'Identity reseteado a 0';
PRINT '';
GO

-- ============================================================================
-- Paso 8: Insertar categorías de Ingresos (Type = 0)
-- ============================================================================
PRINT 'Paso 8: Insertando categorías de Ingresos...';

INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Ventas', 0, 1, 1, 1, GETDATE()),
('Servicios', 0, 1, 1, 2, GETDATE()),
('Consultoría', 0, 1, 1, 3, GETDATE()),
('Inversiones', 0, 1, 1, 4, GETDATE()),
('Comisiones', 0, 1, 1, 5, GETDATE()),
('Otros Ingresos', 0, 1, 1, 6, GETDATE());

PRINT 'Categorías de Ingresos insertadas: 6';
PRINT '';
GO

-- ============================================================================
-- Paso 9: Insertar categorías de Gastos (Type = 1)
-- ============================================================================
PRINT 'Paso 9: Insertando categorías de Gastos...';

INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Oficina', 1, 1, 1, 1, GETDATE()),
('Marketing', 1, 1, 1, 2, GETDATE()),
('Software', 1, 1, 1, 3, GETDATE()),
('Servicios Públicos', 1, 1, 1, 4, GETDATE()),
('Transporte', 1, 1, 1, 5, GETDATE()),
('Otros Gastos', 1, 1, 1, 6, GETDATE());

PRINT 'Categorías de Gastos insertadas: 6';
PRINT '';
GO

-- ============================================================================
-- Paso 10: Verificar categorías insertadas
-- ============================================================================
PRINT 'Paso 10: Verificando categorías insertadas...';
PRINT '';

SELECT 
    Id,
    Name AS 'Nombre',
    CASE 
        WHEN Type = 0 THEN 'Ingreso'
        WHEN Type = 1 THEN 'Gasto'
        ELSE 'Desconocido'
    END AS 'Tipo',
    CASE 
        WHEN IsSystemDefault = 1 THEN 'Sí'
        ELSE 'No'
    END AS 'Sistema',
    DisplayOrder AS 'Orden',
    CASE 
        WHEN IsActive = 1 THEN 'Activa'
        ELSE 'Inactiva'
    END AS 'Estado'
FROM Categories 
ORDER BY Type, DisplayOrder;

PRINT '';
GO

-- ============================================================================
-- Paso 11: Marcar migración como aplicada
-- ============================================================================
PRINT 'Paso 11: Marcando migración como aplicada...';

IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20260221054914_UpdateCategoryToGlobalSystem')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
    VALUES ('20260221054914_UpdateCategoryToGlobalSystem', '8.0.0');
    PRINT 'Migración marcada como aplicada';
END
ELSE
BEGIN
    PRINT 'Migración ya estaba marcada como aplicada';
END

PRINT '';
GO

-- ============================================================================
-- Paso 12: Resumen final
-- ============================================================================
PRINT '========================================';
PRINT 'Resumen de la actualización:';
PRINT '========================================';

DECLARE @TotalCat INT;
DECLARE @IncomeCat INT;
DECLARE @ExpenseCat INT;

SELECT @TotalCat = COUNT(*) FROM Categories;
SELECT @IncomeCat = COUNT(*) FROM Categories WHERE Type = 0;
SELECT @ExpenseCat = COUNT(*) FROM Categories WHERE Type = 1;

PRINT 'Total de categorías: ' + CAST(@TotalCat AS VARCHAR(10));
PRINT 'Categorías de Ingresos: ' + CAST(@IncomeCat AS VARCHAR(10));
PRINT 'Categorías de Gastos: ' + CAST(@ExpenseCat AS VARCHAR(10));
PRINT '';
PRINT '✓ Actualización completada exitosamente';
PRINT '✓ Estructura de Categories actualizada';
PRINT '✓ Categorías fijas insertadas';
PRINT '✓ Migración marcada como aplicada';
PRINT '========================================';
GO