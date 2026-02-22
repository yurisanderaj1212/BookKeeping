# 🏦 PLAN DE INTEGRACIÓN PLAID API

**Fecha:** 21 de Febrero de 2026  
**Objetivo:** Integrar Plaid para conectar cuentas bancarias y sincronizar transacciones automáticamente  
**Cliente:** Sistema de contabilidad para pequeñas empresas

---

## 📋 ¿QUÉ ES PLAID?

Plaid es una API profesional que permite:
- ✅ Conectar cuentas bancarias de forma segura
- ✅ Obtener transacciones automáticamente (ingresos y gastos)
- ✅ Verificar balances en tiempo real
- ✅ Soporta miles de bancos en USA y otros países
- ✅ Cumple con estándares de seguridad bancaria

**Casos de uso para nuestro cliente:**
- Usuario conecta su tarjeta de crédito empresarial
- Sistema sincroniza automáticamente todas las transacciones
- No necesita ingresar manualmente cada gasto/ingreso
- Datos actualizados en tiempo real

---

## 💰 COSTOS DE PLAID (2026)

### **Modelo de Precios:**
- **Desarrollo/Sandbox:** GRATIS (para pruebas)
- **Producción:** 
  - Pago por conexión exitosa: $0.50 - $2.00 por usuario
  - Descuentos por volumen a partir de 10,000 conexiones
  - Plan básico: ~$500/mes mínimo

### **Recomendación:**
1. Empezar con **Sandbox (GRATIS)** para desarrollo
2. Lanzar MVP con primeros clientes
3. Evaluar costos reales según adopción
4. Negociar plan empresarial si crece

---

## 🏗️ ARQUITECTURA DE LA INTEGRACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                            │
└─────────────────────────────────────────────────────────────┘

1. USUARIO (Frontend)
   │
   ├─> Clic en "Conectar Banco" 
   │
   └─> Plaid Link Modal se abre
       │
       ├─> Usuario selecciona su banco
       ├─> Ingresa credenciales (seguro, en Plaid)
       └─> Plaid valida y retorna public_token
           │
           └─> Frontend envía public_token al Backend

2. BACKEND (ASP.NET Core)
   │
   ├─> Recibe public_token
   ├─> Intercambia por access_token (permanente)
   ├─> Guarda access_token en BD (encriptado)
   └─> Crea registro de Account vinculado a Plaid
       │
       └─> Inicia sincronización de transacciones

3. SINCRONIZACIÓN AUTOMÁTICA
   │
   ├─> Backend llama /transactions/sync periódicamente
   ├─> Plaid retorna nuevas transacciones
   ├─> Backend las guarda en BD
   └─> Frontend muestra transacciones actualizadas
```

---

## 📦 COMPONENTES A DESARROLLAR

### **FASE 1: CONFIGURACIÓN INICIAL** (2-3 horas)

#### **1.1 Crear Cuenta en Plaid**
- [ ] Registrarse en https://dashboard.plaid.com
- [ ] Obtener credenciales:
  - `PLAID_CLIENT_ID`
  - `PLAID_SECRET` (Sandbox)
  - `PLAID_SECRET` (Production - después)
- [ ] Configurar webhook URL (para notificaciones)

#### **1.2 Instalar Dependencias**

**Backend (ASP.NET Core):**
```bash
dotnet add package Going.Plaid
```

**Frontend (Next.js):**
```bash
npm install react-plaid-link
```

#### **1.3 Configurar Variables de Entorno**

**Backend (`appsettings.json`):**
```json
{
  "Plaid": {
    "ClientId": "tu_client_id",
    "Secret": "tu_secret_sandbox",
    "Environment": "sandbox",
    "WebhookUrl": "https://tu-dominio.com/api/plaid/webhook"
  }
}
```

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5088/api
```

---

### **FASE 2: BACKEND - MODELOS Y SERVICIOS** (4-5 horas)

#### **2.1 Crear Modelo PlaidAccount**

```csharp
// Models/PlaidAccount.cs
public class PlaidAccount
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    [Required]
    public int AccountId { get; set; }
    
    [ForeignKey("AccountId")]
    public Account Account { get; set; }
    
    // Plaid identifiers
    [Required]
    [MaxLength(255)]
    public string PlaidItemId { get; set; } // Item ID de Plaid
    
    [Required]
    [MaxLength(500)]
    public string PlaidAccessToken { get; set; } // Encriptado
    
    [MaxLength(255)]
    public string PlaidAccountId { get; set; } // ID de cuenta específica
    
    [MaxLength(100)]
    public string InstitutionName { get; set; } // Nombre del banco
    
    [MaxLength(50)]
    public string AccountMask { get; set; } // Últimos 4 dígitos
    
    public bool IsActive { get; set; } = true;
    
    public DateTime? LastSyncedAt { get; set; }
    
    [MaxLength(500)]
    public string? SyncCursor { get; set; } // Para /transactions/sync
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

#### **2.2 Crear PlaidController**

```csharp
// Controllers/PlaidController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaidController : ControllerBase
{
    private readonly IPlaidService _plaidService;
    
    // 1. Crear link_token para iniciar Plaid Link
    [HttpPost("create-link-token")]
    public async Task<IActionResult> CreateLinkToken()
    {
        var userId = GetUserId();
        var linkToken = await _plaidService.CreateLinkTokenAsync(userId);
        return Ok(new { link_token = linkToken });
    }
    
    // 2. Intercambiar public_token por access_token
    [HttpPost("exchange-public-token")]
    public async Task<IActionResult> ExchangePublicToken([FromBody] ExchangeTokenRequest request)
    {
        var userId = GetUserId();
        var result = await _plaidService.ExchangePublicTokenAsync(userId, request.PublicToken, request.Metadata);
        return Ok(result);
    }
    
    // 3. Sincronizar transacciones manualmente
    [HttpPost("sync-transactions/{accountId}")]
    public async Task<IActionResult> SyncTransactions(int accountId)
    {
        var userId = GetUserId();
        var transactions = await _plaidService.SyncTransactionsAsync(userId, accountId);
        return Ok(new { count = transactions.Count, transactions });
    }
    
    // 4. Obtener cuentas conectadas
    [HttpGet("connected-accounts")]
    public async Task<IActionResult> GetConnectedAccounts()
    {
        var userId = GetUserId();
        var accounts = await _plaidService.GetConnectedAccountsAsync(userId);
        return Ok(accounts);
    }
    
    // 5. Desconectar cuenta
    [HttpDelete("disconnect/{accountId}")]
    public async Task<IActionResult> DisconnectAccount(int accountId)
    {
        var userId = GetUserId();
        await _plaidService.DisconnectAccountAsync(userId, accountId);
        return NoContent();
    }
    
    // 6. Webhook para recibir notificaciones de Plaid
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook([FromBody] PlaidWebhookRequest webhook)
    {
        await _plaidService.HandleWebhookAsync(webhook);
        return Ok();
    }
}
```

#### **2.3 Crear PlaidService**

```csharp
// Services/IPlaidService.cs
public interface IPlaidService
{
    Task<string> CreateLinkTokenAsync(int userId);
    Task<PlaidAccountDto> ExchangePublicTokenAsync(int userId, string publicToken, PlaidMetadata metadata);
    Task<List<TransactionDto>> SyncTransactionsAsync(int userId, int accountId);
    Task<List<PlaidAccountDto>> GetConnectedAccountsAsync(int userId);
    Task DisconnectAccountAsync(int userId, int accountId);
    Task HandleWebhookAsync(PlaidWebhookRequest webhook);
}

// Services/PlaidService.cs
public class PlaidService : IPlaidService
{
    private readonly PlaidClient _plaidClient;
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    
    public PlaidService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
        
        // Inicializar cliente Plaid
        var clientId = _config["Plaid:ClientId"];
        var secret = _config["Plaid:Secret"];
        var environment = _config["Plaid:Environment"]; // sandbox, development, production
        
        _plaidClient = new PlaidClient(
            clientId, 
            secret, 
            environment == "production" ? Environment.Production : Environment.Sandbox
        );
    }
    
    // Implementar métodos...
}
```

#### **2.4 Migración de Base de Datos**

```bash
dotnet ef migrations add AddPlaidIntegration
dotnet ef database update
```

---

### **FASE 3: FRONTEND - UI Y COMPONENTES** (5-6 horas)

#### **3.1 Crear PlaidService (Frontend)**

```typescript
// services/plaidService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api'

export interface PlaidAccount {
  id: number
  accountId: number
  institutionName: string
  accountMask: string
  isActive: boolean
  lastSyncedAt: string | null
}

class PlaidService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async createLinkToken(): Promise<string> {
    const response = await fetch(`${API_URL}/plaid/create-link-token`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Error creando link token')
    
    const data = await response.json()
    return data.link_token
  }

  async exchangePublicToken(publicToken: string, metadata: any): Promise<PlaidAccount> {
    const response = await fetch(`${API_URL}/plaid/exchange-public-token`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ publicToken, metadata })
    })
    
    if (!response.ok) throw new Error('Error conectando cuenta')
    
    return response.json()
  }

  async getConnectedAccounts(): Promise<PlaidAccount[]> {
    const response = await fetch(`${API_URL}/plaid/connected-accounts`, {
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Error obteniendo cuentas')
    
    return response.json()
  }

  async syncTransactions(accountId: number): Promise<any> {
    const response = await fetch(`${API_URL}/plaid/sync-transactions/${accountId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Error sincronizando transacciones')
    
    return response.json()
  }

  async disconnectAccount(accountId: number): Promise<void> {
    const response = await fetch(`${API_URL}/plaid/disconnect/${accountId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) throw new Error('Error desconectando cuenta')
  }
}

export const plaidService = new PlaidService()
export default plaidService
```

#### **3.2 Crear Componente PlaidLinkButton**

```typescript
// components/plaid/PlaidLinkButton.tsx
'use client'

import { useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { CreditCard, Loader2 } from 'lucide-react'
import plaidService from '../../services/plaidService'

interface PlaidLinkButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function PlaidLinkButton({ onSuccess, onError }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Configurar Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        setLoading(true)
        await plaidService.exchangePublicToken(publicToken, metadata)
        onSuccess?.()
      } catch (error: any) {
        onError?.(error.message)
      } finally {
        setLoading(false)
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        onError?.('Conexión cancelada')
      }
    }
  })

  const handleClick = async () => {
    try {
      setLoading(true)
      const token = await plaidService.createLinkToken()
      setLinkToken(token)
      
      // Esperar un momento para que el token se establezca
      setTimeout(() => {
        open()
        setLoading(false)
      }, 100)
    } catch (error: any) {
      setLoading(false)
      onError?.(error.message)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Conectando...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          <span>Conectar Banco</span>
        </>
      )}
    </button>
  )
}
```

#### **3.3 Crear Página de Cuentas Conectadas**

```typescript
// app/accounts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { CreditCard, RefreshCw, Trash2, CheckCircle } from 'lucide-react'
import PlaidLinkButton from '../../components/plaid/PlaidLinkButton'
import plaidService, { PlaidAccount } from '../../services/plaidService'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../hooks/useAuth'

export default function AccountsPage() {
  const { logout } = useAuth()
  const [accounts, setAccounts] = useState<PlaidAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await plaidService.getConnectedAccounts()
      setAccounts(data)
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (accountId: number) => {
    try {
      setSyncing(accountId)
      await plaidService.syncTransactions(accountId)
      await loadAccounts()
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(null)
    }
  }

  const handleDisconnect = async (accountId: number) => {
    if (!confirm('¿Estás seguro de desconectar esta cuenta?')) return
    
    try {
      await plaidService.disconnectAccount(accountId)
      await loadAccounts()
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={logout} onToggle={setSidebarCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cuentas Bancarias
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Conecta tus cuentas para sincronizar transacciones automáticamente
                </p>
              </div>
              <PlaidLinkButton 
                onSuccess={loadAccounts}
                onError={(error) => alert(error)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando cuentas...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cuentas conectadas
              </h3>
              <p className="text-gray-600 mb-6">
                Conecta tu banco para sincronizar transacciones automáticamente
              </p>
              <PlaidLinkButton 
                onSuccess={loadAccounts}
                onError={(error) => alert(error)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <div key={account.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {account.institutionName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          •••• {account.accountMask}
                        </p>
                      </div>
                    </div>
                    {account.isActive && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {account.lastSyncedAt && (
                    <p className="text-xs text-gray-500 mb-4">
                      Última sincronización: {new Date(account.lastSyncedAt).toLocaleString('es-ES')}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSync(account.accountId)}
                      disabled={syncing === account.accountId}
                      className="flex-1 bg-primary-50 text-primary-600 px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing === account.accountId ? 'animate-spin' : ''}`} />
                      <span>Sincronizar</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(account.accountId)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### **FASE 4: SINCRONIZACIÓN AUTOMÁTICA** (3-4 horas)

#### **4.1 Crear Background Service**

```csharp
// Services/PlaidSyncBackgroundService.cs
public class PlaidSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PlaidSyncBackgroundService> _logger;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var plaidService = scope.ServiceProvider.GetRequiredService<IPlaidService>();
                
                // Sincronizar todas las cuentas activas cada 4 horas
                await plaidService.SyncAllAccountsAsync();
                
                await Task.Delay(TimeSpan.FromHours(4), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en sincronización automática");
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }
    }
}
```

#### **4.2 Registrar en Program.cs**

```csharp
// Program.cs
builder.Services.AddHostedService<PlaidSyncBackgroundService>();
```

---

## 🎯 FLUJO DE USUARIO FINAL

### **Experiencia del Usuario:**

1. **Usuario va a página "Cuentas"**
   - Ve botón profesional "Conectar Banco" con icono de tarjeta

2. **Clic en "Conectar Banco"**
   - Se abre modal elegante de Plaid Link
   - Usuario busca su banco (ej: Chase, Bank of America)
   - Ingresa credenciales de forma segura

3. **Plaid valida y conecta**
   - Usuario ve confirmación
   - Cuenta aparece en lista con logo del banco
   - Muestra últimos 4 dígitos de cuenta

4. **Sincronización automática**
   - Sistema descarga transacciones históricas (30 días)
   - Transacciones aparecen en página "Transacciones"
   - Categorizadas automáticamente

5. **Actualizaciones continuas**
   - Cada 4 horas: sincronización automática
   - Usuario puede forzar sync con botón "Sincronizar"
   - Notificaciones de nuevas transacciones

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Seguridad:**
- ✅ Nunca almacenar credenciales bancarias
- ✅ Encriptar access_tokens en BD
- ✅ Usar HTTPS en producción
- ✅ Validar webhooks de Plaid

### **Categorización:**
- Plaid retorna categorías sugeridas
- Mapear a nuestras 12 categorías fijas
- Permitir al usuario recategorizar

### **Manejo de Errores:**
- Cuentas desconectadas (usuario cambió contraseña)
- Bancos en mantenimiento
- Límites de API alcanzados

### **Testing:**
- Usar Sandbox con bancos de prueba
- Probar flujo completo antes de producción
- Validar sincronización de transacciones

---

## 📅 CRONOGRAMA ESTIMADO

| Fase | Descripción | Tiempo | Prioridad |
|------|-------------|--------|-----------|
| 1 | Configuración inicial | 2-3 horas | ALTA |
| 2 | Backend (modelos, servicios, API) | 4-5 horas | ALTA |
| 3 | Frontend (UI, componentes) | 5-6 horas | ALTA |
| 4 | Sincronización automática | 3-4 horas | MEDIA |
| 5 | Testing y ajustes | 3-4 horas | ALTA |
| **TOTAL** | **Integración completa** | **17-22 horas** | - |

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### **PASO 1: Validar con Cliente**
- [ ] Confirmar que Plaid es la solución correcta
- [ ] Verificar presupuesto para costos de Plaid
- [ ] Definir bancos prioritarios (USA, México, etc.)

### **PASO 2: Crear Cuenta Plaid**
- [ ] Registrarse en Plaid Dashboard
- [ ] Obtener credenciales Sandbox
- [ ] Configurar webhook URL

### **PASO 3: Desarrollo Fase por Fase**
- [ ] Empezar con Fase 1 (configuración)
- [ ] Continuar con Fase 2 (backend)
- [ ] Luego Fase 3 (frontend)
- [ ] Finalmente Fase 4 (sincronización)

### **PASO 4: Testing Exhaustivo**
- [ ] Probar con múltiples bancos
- [ ] Validar sincronización
- [ ] Verificar categorización

### **PASO 5: Lanzamiento**
- [ ] Migrar a credenciales Production
- [ ] Monitorear primeros usuarios
- [ ] Ajustar según feedback

---

## 💡 ALTERNATIVAS A CONSIDERAR

Si Plaid resulta muy costoso:

1. **Yodlee** - Similar a Plaid, más económico
2. **Teller** - Más barato, menos bancos
3. **Manual CSV Import** - Gratis, menos conveniente
4. **Stripe Financial Connections** - Si ya usan Stripe

---

## 📞 PREGUNTAS PARA EL CLIENTE

Antes de empezar, necesitamos confirmar:

1. ¿En qué países operan sus clientes? (Plaid soporta USA, Canadá, UK, Europa)
2. ¿Cuántos usuarios esperan en el primer año?
3. ¿Tienen presupuesto para ~$500/mes de Plaid?
4. ¿Prefieren sincronización automática o manual?
5. ¿Necesitan soporte para múltiples cuentas por usuario?

---

**Desarrollado por:** Equipo Fullstack  
**Fecha:** 21 de Febrero de 2026  
**Estado:** PLAN COMPLETO - LISTO PARA VALIDACIÓN ✅

---

**🏦 INTEGRACIÓN PLAID - SOLUCIÓN PROFESIONAL PARA SINCRONIZACIÓN BANCARIA 🏦**
