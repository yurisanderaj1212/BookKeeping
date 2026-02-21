# 🔧 Instrucciones para Agregar CORS al Backend

**Para:** Tu amigo (desarrollador del backend)  
**Fecha:** 9 de Febrero de 2026  
**Prioridad:** 🔴 **CRÍTICO** - Sin esto el frontend no puede comunicarse con el backend

---

## 📋 ¿Qué es CORS y por qué lo necesitamos?

CORS (Cross-Origin Resource Sharing) es una medida de seguridad del navegador que bloquea requests entre diferentes orígenes (dominios/puertos).

**Problema actual:**
- Frontend corre en: `http://localhost:3000`
- Backend corre en: `http://localhost:5088`
- El navegador bloquea las peticiones porque son diferentes puertos

**Solución:** Configurar CORS en el backend para permitir requests desde el frontend.

---

## 🎯 Cambios Necesarios

### Archivo a modificar: `BookKeeping/Program.cs`

**Necesitas agregar 2 bloques de código en lugares específicos:**

---

### 📍 CAMBIO #1: Agregar el servicio CORS

**Ubicación:** Después de `builder.Services.AddSwaggerGen(...)` y antes de `builder.Services.AddAutoMapper(...)`

**Código a agregar:**

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

**Contexto (cómo debería verse):**

```csharp
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ⬇️⬇️⬇️ AGREGAR ESTE BLOQUE AQUÍ ⬇️⬇️⬇️
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
// ⬆️⬆️⬆️ HASTA AQUÍ ⬆️⬆️⬆️

builder.Services.AddAutoMapper(typeof(TransactionProfile));
builder.Services.AddScoped<ITransactionService, TransactionService>();
```

---

### 📍 CAMBIO #2: Usar el middleware CORS

**Ubicación:** Después de `app.UseHttpsRedirection();` y antes de `app.UseAuthentication();`

**Código a agregar:**

```csharp
app.UseCors("AllowFrontend");
```

**Contexto (cómo debería verse):**

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ⬇️⬇️⬇️ AGREGAR ESTA LÍNEA AQUÍ ⬇️⬇️⬇️
app.UseCors("AllowFrontend");
// ⬆️⬆️⬆️ HASTA AQUÍ ⬆️⬆️⬆️

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

## ✅ Verificación

Después de hacer los cambios:

1. **Guardar el archivo** `Program.cs`
2. **Detener el backend** si está corriendo (Ctrl+C)
3. **Iniciar el backend nuevamente:**
   ```bash
   cd BookKeeping
   dotnet run
   ```
4. **Verificar que inicia sin errores**
5. **Avisar al equipo de frontend** que ya pueden probar

---

## 🧪 Cómo probar que funciona

Una vez que hagas los cambios y reinicies el backend:

1. El frontend debería poder hacer login/registro sin errores de CORS
2. En la consola del navegador (F12) NO deberías ver errores como:
   ```
   Access to fetch at 'http://localhost:5088/api/auth/login' from origin 'http://localhost:3000' 
   has been blocked by CORS policy
   ```

---

## 📝 Notas Importantes

### ⚠️ Orden de los middlewares

El orden es **CRÍTICO**. `app.UseCors()` debe estar:
- ✅ **DESPUÉS** de `app.UseHttpsRedirection()`
- ✅ **ANTES** de `app.UseAuthentication()`
- ✅ **ANTES** de `app.UseAuthorization()`

Si lo pones en otro lugar, puede que no funcione correctamente.

### 🔒 Seguridad en Producción

Este código es para **desarrollo local**. En producción deberías:
- Cambiar `"http://localhost:3000"` por la URL real del frontend
- Considerar usar variables de entorno para la URL
- Ser más restrictivo con los métodos y headers permitidos

---

## 🆘 Troubleshooting

### Si después de agregar CORS sigue sin funcionar:

1. **Verifica que guardaste el archivo**
2. **Verifica que reiniciaste el backend** (detener y volver a correr)
3. **Verifica que el frontend está en el puerto 3000**
4. **Limpia la caché del navegador** (Ctrl+Shift+Delete)
5. **Revisa la consola del backend** por errores al iniciar

### Si ves errores al compilar:

- Asegúrate de que el código está exactamente como se muestra
- Verifica que no falten llaves `{` o `}`
- Verifica que no falten punto y coma `;`

---

## 📞 Contacto

Si tienes dudas o problemas, avísanos en el equipo. Este cambio es **crítico** para que el frontend pueda comunicarse con el backend.

---

**¡Gracias por tu ayuda! 🚀**
