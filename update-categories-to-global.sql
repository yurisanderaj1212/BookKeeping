-- ============================================================================
-- Script: Actualizar Categorías a Sistema Global
-- Proyecto: BookKeeping
-- Fecha: 11 de Febrero de 2026
-- Descripción: Convierte las categorías de usuario-específicas a globales
-- ============================================================================

USE BookKeepingDB;
GO

PRINT '========================================';
PRINT 'Iniciando actualización de categorías';
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
-- Paso 2: Eliminar categorías antiguas
-- ============================================================================
PRINT 'Paso 2: Eliminando categorías antiguas...';
DELETE FROM Categories;
DECLARE @CatCount INT = @@ROWCOUNT;
PRINT 'Categorías eliminadas: ' + CAST(@CatCount AS VARCHAR(10));
PRINT '';
GO

-- ============================================================================
-- Paso 3: Resetear Identity
-- ============================================================================
PRINT 'Paso 3: Reseteando Identity de Categories...';
DBCC CHECKIDENT ('Categories', RESEED, 0);
PRINT 'Identity reseteado a 0';
PRINT '';
GO

-- ============================================================================
-- Paso 4: Insertar categorías de Ingresos (Type = 0)
-- ============================================================================
PRINT 'Paso 4: Insertando categorías de Ingresos...';

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
-- Paso 5: Insertar categorías de Gastos (Type = 1)
-- ============================================================================
PRINT 'Paso 5: Insertando categorías de Gastos...';

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
-- Paso 6: Verificar categorías insertadas
-- ============================================================================
PRINT 'Paso 6: Verificando categorías insertadas...';
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
-- Paso 7: Resumen final
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
PRINT '✓ Script completado exitosamente';
PRINT '========================================';
GO
