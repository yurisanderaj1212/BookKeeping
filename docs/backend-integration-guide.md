# Backend Integration Guide - Authentication System

## Overview
Esta guía describe cómo debe funcionar el backend en .NET para integrar con el sistema de autenticación del frontend desarrollado en Next.js.

## Architecture Overview

```
Frontend (Next.js) ←→ Backend API (.NET) ←→ Database
                   ↕
              External OAuth Providers
              (Google, Microsoft, Apple)
```

## Authentication Endpoints Required

### 1. **POST /api/auth/login**
**Purpose**: Traditional email/password login

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userPassword123",
  "rememberMe": true
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "TechStart Inc",
      "occupation": "Developer",
      "role": "user",
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### 2. **POST /api/auth/register**
**Purpose**: User registration with email/password

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "company": "TechStart Inc",
  "occupation": "Developer",
  "customOccupation": "Custom Job Title",
  "password": "userPassword123",
  "confirmPassword": "userPassword123",
  "agreeToTerms": true
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "TechStart Inc",
      "occupation": "Developer",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

### 3. **POST /api/auth/forgot-password**
**Purpose**: Password reset request

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### 4. **POST /api/auth/reset-password**
**Purpose**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### 5. **POST /api/auth/refresh**
**Purpose**: Refresh access token

**Request Body**:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### 6. **POST /api/auth/logout**
**Purpose**: Logout user and invalidate tokens

**Request Headers**:
```
Authorization: Bearer jwt_access_token
```

## Social Authentication Endpoints

### 1. **GET /api/auth/google**
**Purpose**: Initiate Google OAuth flow
**Response**: Redirect to Google OAuth consent screen

### 2. **GET /api/auth/google/callback**
**Purpose**: Handle Google OAuth callback
**Response**: Redirect to frontend with tokens or error

### 3. **GET /api/auth/microsoft**
**Purpose**: Initiate Microsoft OAuth flow

### 4. **GET /api/auth/microsoft/callback**
**Purpose**: Handle Microsoft OAuth callback

### 5. **GET /api/auth/apple**
**Purpose**: Initiate Apple OAuth flow

### 6. **GET /api/auth/apple/callback**
**Purpose**: Handle Apple OAuth callback

## Database Schema Recommendations

### Users Table
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255), -- NULL for social login users
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Company NVARCHAR(255),
    Occupation NVARCHAR(100),
    Role NVARCHAR(50) DEFAULT 'user',
    IsEmailVerified BIT DEFAULT 0,
    EmailVerificationToken NVARCHAR(255),
    PasswordResetToken NVARCHAR(255),
    PasswordResetExpires DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2
);
```

### UserSocialLogins Table
```sql
CREATE TABLE UserSocialLogins (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(Id),
    Provider NVARCHAR(50) NOT NULL, -- 'google', 'microsoft', 'apple'
    ProviderId NVARCHAR(255) NOT NULL,
    ProviderEmail NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### RefreshTokens Table
```sql
CREATE TABLE RefreshTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(Id),
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsRevoked BIT DEFAULT 0
);
```

## Security Recommendations

### 1. **Password Security**
- Use BCrypt or Argon2 for password hashing
- Minimum 8 characters, require complexity
- Implement password strength validation

### 2. **JWT Configuration**
```json
{
  "AccessTokenExpiry": "15m",
  "RefreshTokenExpiry": "7d",
  "Issuer": "ChillNumbers",
  "Audience": "ChillNumbers-Users",
  "SecretKey": "your-super-secure-secret-key"
}
```

### 3. **Rate Limiting**
- Login attempts: 5 per minute per IP
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

### 4. **CORS Configuration**
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://yourdomain.com")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

## Frontend Integration Points

### 1. **API Client Configuration**
El frontend necesitará un cliente HTTP configurado para:
- Base URL del API
- Interceptors para tokens
- Error handling
- Refresh token logic

### 2. **Environment Variables (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
```

### 3. **Token Storage Strategy**
- Access Token: Memory/State (más seguro)
- Refresh Token: HttpOnly Cookie (recomendado) o localStorage

## Error Handling Standards

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional technical details",
    "field": "fieldName" // For validation errors
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Wrong email/password
- `EMAIL_ALREADY_EXISTS`: Registration with existing email
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `INVALID_TOKEN`: JWT token invalid/expired
- `EMAIL_NOT_VERIFIED`: Account not verified
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_ERROR`: Input validation failed

## Email Service Integration

### Required Email Templates
1. **Welcome Email**: After registration
2. **Email Verification**: Verify email address
3. **Password Reset**: Reset password link
4. **Login Alert**: Suspicious login activity

### Email Configuration
```json
{
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "EnableSsl": true,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  },
  "EmailTemplates": {
    "WelcomeTemplate": "welcome-template.html",
    "VerificationTemplate": "verification-template.html",
    "PasswordResetTemplate": "password-reset-template.html"
  }
}
```

## Testing Recommendations

### Unit Tests
- Authentication service methods
- Password hashing/validation
- JWT token generation/validation
- Email service integration

### Integration Tests
- Complete authentication flows
- OAuth provider integrations
- Database operations
- API endpoint responses

## Deployment Considerations

### 1. **Environment Configuration**
- Development: HTTP allowed
- Production: HTTPS only
- Staging: Mirror production settings

### 2. **Database Migrations**
- Use Entity Framework migrations
- Seed initial data (roles, admin user)
- Backup strategy for user data

### 3. **Monitoring & Logging**
- Authentication attempts (success/failure)
- OAuth provider responses
- Token refresh patterns
- Security events

## Next Steps for Backend Developer

1. **Setup Project Structure**
   - Create .NET Web API project
   - Configure Entity Framework
   - Setup authentication middleware

2. **Implement Core Features**
   - User registration/login
   - JWT token management
   - Password reset functionality

3. **Add OAuth Integration**
   - Google OAuth setup
   - Microsoft OAuth setup
   - Apple OAuth setup

4. **Testing & Documentation**
   - API documentation (Swagger)
   - Postman collection
   - Unit/integration tests

5. **Security Hardening**
   - Rate limiting
   - Input validation
   - Security headers

¿Necesitas que profundice en alguna sección específica o que agregue más detalles sobre algún aspecto particular?