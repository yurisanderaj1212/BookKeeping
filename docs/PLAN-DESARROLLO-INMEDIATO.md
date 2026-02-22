# 🚀 PLAN DE DESARROLLO INMEDIATO

**Fecha:** 21 de Febrero de 2026  
**Objetivo:** Continuar desarrollo sin costos externos, preparar bases para futuras integraciones

---

## ✅ DECISIONES TOMADAS

1. **Plaid/Stripe:** Dejar para después (cuando cliente decida pagar)
2. **Cuentas bancarias:** Preparar estructura básica ahora
3. **Enfoque:** Continuar con funcionalidad core sin APIs externas

---

## 🎯 LO QUE PODEMOS HACER AHORA (SIN COSTOS)

### **FASE 1: GESTIÓN BÁSICA DE CUENTAS** (4-6 horas)

**Objetivo:** Permitir que usuarios creen cuentas manualmente (Efectivo, Banco, Tarjeta)

#### **Backend (Ya existe AccountsController):**
- ✅ Ya tenemos el modelo `Account`
- ✅ Ya tenemos `AccountsController`
- ✅ Ya tenemos `AccountService`
- ✅ Solo necesitamos ajustar para uso manual

#### **Frontend (Crear desde cero):**

**1. Crear `accountService.ts`** (1 hora)
```typescript
// services/accountService.ts
- createAccount()
- getAccounts()
- updateAccount()
- deleteAccount()
- getAccountBalance()
```

**2. Crear página `/accounts`** (2 horas)
```typescript
// app/accounts/page.tsx
- Lista de cuentas del usuario
- Botón "Agregar Cuenta"
- Mostrar balance de cada cuenta
- Editar/Eliminar cuentas
```

**3. Crear componentes** (2 horas)
```typescript
// components/accounts/AccountForm.tsx
- Formulario para crear/editar cuenta
- Campos: Nombre, Tipo, Balance Inicial, Moneda

// components/accounts/AccountList.tsx
- Lista de cuentas con tarjetas
- Balance actual
- Acciones (editar, eliminar)
```

**4. Integrar con Transacciones** (1 hora)
```typescript
// components/transactions/TransactionForm.tsx
- Agregar selector de cuenta
- Mostrar balance disponible
- Validar que cuenta exista
```

**Resultado:**
- ✅ Usuario puede crear cuentas manualmente
- ✅ Transacciones se vinculan a cuentas
- ✅ Se calcula balance automáticamente
- ✅ Base lista para Plaid/Stripe después

---

### **FASE 2: CONECTAR DASHBOARD CON DATOS REALES** (6-8 horas)

**Objetivo:** Reemplazar datos mock con datos reales del backend

#### **Backend:**

**1. Crear `DashboardController`** (3 horas)
```csharp
// Controllers/DashboardController.cs

[HttpGet("summary")]
// Retorna: ingresos, gastos, ganancia neta, transacciones pendientes

[HttpGet("chart-data")]
// Retorna: datos para gráficos por día/semana/mes

[HttpGet("category-breakdown")]
// Retorna: gastos por categoría

[HttpGet("recent-transactions")]
// Retorna: últimas 10 transacciones
```

**2. Crear `DashboardService`** (2 horas)
```csharp
// Services/DashboardService.cs
- CalculateSummary(userId, period)
- GetChartData(userId, period)
- GetCategoryBreakdown(userId, period)
- GetRecentTransactions(userId, limit)
```

#### **Frontend:**

**3. Crear `dashboardService.ts`** (1 hora)
```typescript
// services/dashboardService.ts
- getSummary(period)
- getChartData(period)
- getCategoryBreakdown(period)
- getRecentTransactions()
```

**4. Actualizar componentes del dashboard** (2 horas)
```typescript
// Reemplazar datos mock con llamadas a API
- StatsCards → usar dashboardService.getSummary()
- WeeklyChart → usar dashboardService.getChartData()
- CategoryBreakdown → usar dashboardService.getCategoryBreakdown()
- RecentTransactions → usar dashboardService.getRecentTransactions()
```

**Resultado:**
- ✅ Dashboard muestra datos reales
- ✅ Estadísticas calculadas del backend
- ✅ Gráficos con datos reales
- ✅ Experiencia completa y funcional

---

### **FASE 3: PREPARAR ESTRUCTURA PARA STRIPE** (2-3 horas)

**Objetivo:** Dejar todo listo para cuando se decida integrar Stripe

#### **Backend:**

**1. Crear modelos preparatorios** (1 hora)
```csharp
// Models/Subscription.cs
public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string PlanType { get; set; } // Free, Basic, Premium
    public decimal MonthlyPrice { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public string? StripeSubscriptionId { get; set; } // Para después
    public string? StripeCustomerId { get; set; } // Para después
}

// Models/PlaidConnection.cs (preparatorio)
public class PlaidConnection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public string? PlaidItemId { get; set; }
    public string? PlaidAccessToken { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastSyncedAt { get; set; }
}
```

**2. Crear migración** (30 min)
```bash
dotnet ef migrations add PrepareForStripeAndPlaid
dotnet ef database update
```

**3. Crear controladores básicos** (1 hora)
```csharp
// Controllers/SubscriptionController.cs
[HttpGet("current")]
// Retorna plan actual del usuario

[HttpGet("plans")]
// Retorna planes disponibles

// Endpoints de Stripe se agregan después
```

#### **Frontend:**

**4. Crear página de planes** (30 min)
```typescript
// app/pricing/page.tsx
- Mostrar planes: Free, Basic, Premium
- Características de cada plan
- Botón "Próximamente" (por ahora)
- Cuando se integre Stripe, se activa
```

**Resultado:**
- ✅ Estructura lista para Stripe
- ✅ Base de datos preparada
- ✅ Solo falta conectar Stripe API
- ✅ 80% del trabajo hecho

---

## 📋 RESUMEN DE PRIORIDADES

### **AHORA (Sin costos):**

1. ✅ **Gestión de Cuentas** (4-6 horas)
   - Crear/editar/eliminar cuentas manualmente
   - Vincular con transacciones
   - Calcular balances

2. ✅ **Dashboard con Datos Reales** (6-8 horas)
   - Conectar con backend
   - Estadísticas reales
   - Gráficos con datos reales

3. ✅ **Preparar Estructura Stripe** (2-3 horas)
   - Modelos de suscripción
   - Controladores básicos
   - UI de planes

**Total: 12-17 horas de trabajo**

### **DESPUÉS (Cuando cliente decida):**

4. ⏳ **Integrar Stripe Payments** (8-10 horas)
   - Para cobrar suscripciones
   - Planes: Free, Basic ($10/mes), Premium ($25/mes)

5. ⏳ **Integrar Stripe Financial Connections** (15-20 horas)
   - Conexión automática con bancos
   - Sincronización de transacciones
   - Solo para plan Premium

---

## 🎯 RECOMENDACIÓN INMEDIATA

### **EMPEZAR CON FASE 1: GESTIÓN DE CUENTAS**

**¿Por qué?**
1. Es CRÍTICO para el funcionamiento correcto
2. Backend ya está 100% implementado
3. Solo necesitamos frontend (4-6 horas)
4. Desbloquea funcionalidad de transacciones
5. Sin costos externos

**Pasos:**
1. Crear `accountService.ts`
2. Crear página `/accounts`
3. Crear componentes de UI
4. Integrar con transacciones
5. Probar flujo completo

---

## 💰 MODELO DE NEGOCIO SUGERIDO

### **Planes de Suscripción (Para después con Stripe):**

**FREE (Gratis):**
- ✅ Hasta 50 transacciones/mes
- ✅ 2 cuentas
- ✅ Reportes básicos
- ✅ Entrada manual de transacciones

**BASIC ($10/mes):**
- ✅ Transacciones ilimitadas
- ✅ 5 cuentas
- ✅ Todos los reportes
- ✅ Importación CSV
- ✅ Soporte por email

**PREMIUM ($25/mes):**
- ✅ Todo de Basic
- ✅ Cuentas ilimitadas
- ✅ Conexión automática con bancos (Stripe Financial)
- ✅ Sincronización automática
- ✅ Análisis avanzado
- ✅ Soporte prioritario

**Esto justifica el costo de Stripe:**
- Stripe cobra ~$0.50 por conexión bancaria
- Usuario Premium paga $25/mes
- Margen suficiente para cubrir costos

---

## 🚀 SIGUIENTE PASO

**¿Empezamos con Fase 1: Gestión de Cuentas?**

Sería:
1. Crear servicio de cuentas en frontend
2. Crear página de cuentas con UI profesional
3. Integrar con transacciones existentes
4. Probar flujo completo

**Tiempo estimado:** 4-6 horas  
**Costo:** $0 (sin APIs externas)  
**Impacto:** Alto (funcionalidad crítica)

¿Te parece bien este plan?

---

**Desarrollado por:** Equipo Fullstack  
**Fecha:** 21 de Febrero de 2026  
**Estado:** PLAN LISTO PARA EJECUCIÓN ✅
