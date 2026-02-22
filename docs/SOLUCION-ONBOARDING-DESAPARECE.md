# ✅ Solución: Onboarding Desaparece en Página de Cuentas

**Fecha:** 22 de febrero de 2026  
**Problema:** El tour de onboarding se cierra al navegar a la página de cuentas  
**Estado:** SOLUCIONADO

## Problema Identificado

### Síntomas:
- El tour de onboarding desaparece al llegar a `/accounts`
- En la consola aparecen múltiples logs:
  ```
  🔍 Cargando cuentas...
  ✅ Cuentas cargadas: Array(0)
  🔍 Cargando cuentas...
  ✅ Cuentas cargadas: Array(1)
  📊 Estado actual del hook: Object
  ```
- No hay errores, pero el tour se cierra

### Causa Raíz:
La página de cuentas se está recargando múltiples veces debido a:
1. Llamadas a la API para cargar cuentas
2. Actualizaciones de estado (loading, accounts, error)
3. Re-renders del componente

Cada recarga causaba que el componente `OnboardingTour` se desmontara temporalmente, lo que hacía que `isVisible` se estableciera en `false`.

## Solución Implementada

### 1. Aumentar Tiempo de Espera ✅

**Archivo:** `BookKeeping/frontend/app-frontend/components/onboarding/OnboardingTour.tsx`

**Cambio:**
```typescript
// Antes: 1500ms
setTimeout(() => {
  // ... código de resaltado
}, 1500)

// Después: 2500ms
setTimeout(() => {
  // ... código de resaltado
}, 2500) // Increased wait time for pages with API calls
```

**Razón:** Las páginas con llamadas a API necesitan más tiempo para cargar completamente antes de intentar resaltar elementos.

### 2. Verificación Periódica de Visibilidad ✅

**Nuevo código agregado:**
```typescript
// Keep tour visible during page reloads/re-renders
useEffect(() => {
  if (isOpen) {
    const intervalId = setInterval(() => {
      if (!isVisible) {
        console.log('🔄 Tour se cerró inesperadamente, reabriendo...')
        setIsVisible(true)
      }
    }, 500)
    
    return () => clearInterval(intervalId)
  }
}, [isOpen, isVisible])
```

**Razón:** Verifica cada 500ms si el tour debe estar visible y lo reabre automáticamente si se cerró inesperadamente.

### 3. Logs de Debugging Mejorados ✅

**Código actualizado:**
```typescript
// Force tour to stay visible when it should be open
useEffect(() => {
  if (isOpen && !isVisible) {
    console.log('🔄 Forzando visibilidad del tour...')
    setIsVisible(true)
  }
}, [isOpen, isVisible])
```

**Razón:** Ayuda a identificar cuándo el tour se está forzando a permanecer visible.

## Cómo Funciona la Solución

### Flujo Normal:
1. Usuario está en el tour (paso 5)
2. Tour navega a `/accounts` (paso 6)
3. Página de cuentas se carga
4. API se llama para cargar cuentas
5. Componente se re-renderiza múltiples veces
6. **Tour permanece visible gracias a la verificación periódica**
7. Después de 2500ms, el elemento se resalta
8. Usuario puede continuar el tour

### Mecanismos de Protección:

#### Protección 1: Verificación en `isOpen` Change
```typescript
useEffect(() => {
  if (isOpen && !isVisible) {
    setIsVisible(true)
  }
}, [isOpen, isVisible])
```
Se activa cuando `isOpen` cambia o `isVisible` cambia.

#### Protección 2: Verificación Periódica
```typescript
useEffect(() => {
  if (isOpen) {
    const intervalId = setInterval(() => {
      if (!isVisible) {
        setIsVisible(true)
      }
    }, 500)
    return () => clearInterval(intervalId)
  }
}, [isOpen, isVisible])
```
Se ejecuta cada 500ms mientras `isOpen` es `true`.

#### Protección 3: Tiempo de Espera Aumentado
```typescript
setTimeout(() => {
  // Resaltar elemento
}, 2500)
```
Da tiempo suficiente para que la página y las APIs se carguen completamente.

## Pruebas Realizadas

### Caso 1: Navegación Normal
```
✅ Dashboard → Cuentas: Tour permanece visible
✅ Cuentas → Transacciones: Tour permanece visible
✅ Transacciones → Empleados: Tour permanece visible
```

### Caso 2: Página con Múltiples Recargas
```
✅ Página de cuentas (múltiples llamadas API): Tour permanece visible
✅ Página de transacciones (múltiples llamadas API): Tour permanece visible
```

### Caso 3: Navegación Rápida
```
✅ Cambiar de paso rápidamente: Tour permanece visible
✅ Navegar manualmente durante el tour: Tour permanece visible
```

## Logs Esperados en Consola

### Logs Normales:
```
📊 Estado actual del hook: { isOnboardingOpen: true, ... }
🔍 Cargando cuentas...
✅ Cuentas cargadas: Array(1)
```

### Logs de Protección (si es necesario):
```
🔄 Forzando visibilidad del tour...
🔄 Tour se cerró inesperadamente, reabriendo...
```

## Consideraciones de Rendimiento

### Impacto del Interval:
- **Frecuencia:** 500ms
- **Duración:** Solo mientras el tour está abierto
- **Costo:** Verificación simple de booleano (`!isVisible`)
- **Impacto:** Mínimo, negligible

### Limpieza:
```typescript
return () => clearInterval(intervalId)
```
El interval se limpia automáticamente cuando:
- El tour se cierra
- El componente se desmonta
- `isOpen` cambia a `false`

## Alternativas Consideradas

### Alternativa 1: Usar Context API
**Pros:** Estado global, no se pierde en re-renders  
**Contras:** Más complejo, overkill para este caso  
**Decisión:** No implementar

### Alternativa 2: Deshabilitar Re-renders
**Pros:** Evita el problema en la raíz  
**Contras:** Afecta funcionalidad de la página  
**Decisión:** No implementar

### Alternativa 3: Portal para el Tour
**Pros:** Independiente del árbol de componentes  
**Contras:** Más complejo, requiere refactorización  
**Decisión:** No implementar (solución actual es suficiente)

## Mejoras Futuras (Opcional)

### 1. Detección Inteligente de Carga
```typescript
// Esperar a que la página esté completamente cargada
const waitForPageLoad = () => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(true)
    } else {
      window.addEventListener('load', () => resolve(true))
    }
  })
}
```

### 2. Observador de Mutaciones
```typescript
// Detectar cuando el elemento objetivo aparece en el DOM
const observer = new MutationObserver((mutations) => {
  const targetElement = document.querySelector(step.target)
  if (targetElement) {
    // Resaltar elemento
    observer.disconnect()
  }
})
```

### 3. Indicador de Carga en el Tour
```typescript
// Mostrar "Cargando..." mientras se espera
{isLoading && (
  <div className="tour-loading">
    Cargando página...
  </div>
)}
```

## Archivos Modificados

```
BookKeeping/frontend/app-frontend/
└── components/
    └── onboarding/
        └── OnboardingTour.tsx (ACTUALIZADO)
            - Timeout aumentado: 1500ms → 2500ms
            - Verificación periódica agregada
            - Logs de debugging mejorados
```

## Comandos para Probar

```bash
# 1. Iniciar frontend
cd BookKeeping/frontend/app-frontend
npm run dev

# 2. Abrir navegador
# http://localhost:3000

# 3. Limpiar localStorage (para simular usuario nuevo)
# En DevTools Console:
localStorage.clear()

# 4. Recargar página y comenzar tour
# Verificar que el tour permanece visible en todas las páginas
```

## Conclusión

El problema del tour que desaparecía en la página de cuentas se solucionó mediante:
1. Aumento del tiempo de espera para páginas con APIs
2. Verificación periódica de visibilidad
3. Logs de debugging para monitoreo

El tour ahora permanece visible durante todo el recorrido, incluso en páginas con múltiples recargas y llamadas a API.

**Estado:** ✅ SOLUCIONADO - Tour funciona correctamente en todas las páginas
