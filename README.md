# BookKeeping

Sistema de gestión financiera para individuos y pequeñas empresas.

## 🚀 Estado Actual

- **Frontend**: Next.js 16.1.4 con React 19.2.3 ✅
- **Backend**: ASP.NET Core 8.0 ✅
- **Base de Datos**: SQL Server Express ✅
- **Integración**: Frontend-Backend completada ✅

## 🛠️ Tecnologías

### Frontend
- Next.js 16.1.4 (App Router)
- React 19.2.3
- TypeScript 5.x
- Tailwind CSS v4

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server Express
- JWT Authentication

## 🏃‍♂️ Inicio Rápido

### Frontend
```bash
cd frontend/app-frontend
npm install
npm run dev
```

### Backend
```bash
dotnet restore
dotnet run
```

## 📁 Estructura del Proyecto

```
BookKeeping/
├── frontend/app-frontend/    # Aplicación Next.js
├── Controllers/              # Controladores del API
├── Models/                   # Modelos de datos
├── Services/                 # Servicios de negocio
├── Data/                     # Contexto de base de datos
├── docs/                     # Documentación del proyecto
└── *.sql                     # Scripts de base de datos
```

## 📚 Documentación

Toda la documentación detallada se encuentra en la carpeta [`docs/`](./docs/):

- Guías de integración
- Instrucciones de configuración
- Resolución de problemas
- Estados del proyecto

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5088/api

## 📝 Funcionalidades

- ✅ Autenticación de usuarios (registro/login)
- ✅ Gestión de transacciones (CRUD completo)
- ✅ Categorías predefinidas (ingresos/gastos)
- ✅ Dashboard con métricas
- ✅ Reportes y análisis
- ✅ Exportación de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.