-- ============================================================================
-- Script: Arreglar Foreign Key y eliminar UserId de Categories
-- ============================================================================

USE BookKeepingDB;
GO

PRINT 'Eliminando Foreign Key FK_Categories_Users...';

-- Eliminar la clave foránea
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Categories_Users')
BEGIN
    ALTER TABLE Categories DROP CONSTRAINT FK_Categories_Users;
    PRINT 'Foreign Key FK_Categories_Users eliminada';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_Categories_Users no existe';
END

-- Ahora eliminar la columna UserId
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'UserId')
BEGIN
    ALTER TABLE Categories DROP COLUMN UserId;
    PRINT 'Columna UserId eliminada';
END
ELSE
BEGIN
    PRINT 'Columna UserId ya no existe';
END

-- Insertar categorías de Ingresos (Type = 0)
PRINT 'Insertando categorías de Ingresos...';

INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Ventas', 0, 1, 1, 1, GETDATE()),
('Servicios', 0, 1, 1, 2, GETDATE()),
('Consultoría', 0, 1, 1, 3, GETDATE()),
('Inversiones', 0, 1, 1, 4, GETDATE()),
('Comisiones', 0, 1, 1, 5, GETDATE()),
('Otros Ingresos', 0, 1, 1, 6, GETDATE());

PRINT 'Categorías de Ingresos insertadas: 6';

-- Insertar categorías de Gastos (Type = 1)
PRINT 'Insertando categorías de Gastos...';

INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Oficina', 1, 1, 1, 1, GETDATE()),
('Marketing', 1, 1, 1, 2, GETDATE()),
('Software', 1, 1, 1, 3, GETDATE()),
('Servicios Públicos', 1, 1, 1, 4, GETDATE()),
('Transporte', 1, 1, 1, 5, GETDATE()),
('Otros Gastos', 1, 1, 1, 6, GETDATE());

PRINT 'Categorías de Gastos insertadas: 6';

-- Verificar resultado
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
    DisplayOrder AS 'Orden'
FROM Categories 
ORDER BY Type, DisplayOrder;

PRINT 'Actualización completada exitosamente';
GO