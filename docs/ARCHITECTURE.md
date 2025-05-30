# Arquitectura de Autenticación - OIDC/OAuth 2.0 y SAML 2.0
## Flujos de Autenticación

### Flujo OIDC/OAuth 2.0

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Next.js)
    participant B as Backend (Spring Boot)
    participant O as Okta (OIDC)
    
    U->>F: 1. Accede a la aplicación
    F->>F: 2. Detecta no autenticado
    F->>O: 3. Redirige a /authorize
    O->>U: 4. Muestra login de Okta
    U->>O: 5. Ingresa credenciales
    O->>F: 6. Redirige con authorization code
    F->>O: 7. Intercambia code por tokens
    O->>F: 8. Retorna access_token + id_token
    F->>B: 9. API calls con Bearer token
    B->>O: 10. Valida token con JWKs
    O->>B: 11. Confirma validez
    B->>F: 12. Retorna datos protegidos
```

### Flujo SAML 2.0

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Next.js)
    participant B as Backend (Spring Boot)
    participant O as Okta (SAML IdP)
    
    U->>F: 1. Selecciona login SAML
    F->>B: 2. Solicita SAML AuthnRequest
    B->>B: 3. Genera AuthnRequest
    B->>F: 4. Retorna AuthnRequest URL
    F->>O: 5. Redirige con AuthnRequest
    O->>U: 6. Muestra login de Okta
    U->>O: 7. Ingresa credenciales
    O->>B: 8. POST SAML Response
    B->>B: 9. Valida SAML Assertion
    B->>B: 10. Crea sesión HTTP
    B->>F: 11. Redirige con sesión
    F->>B: 12. Accede con Cookie de sesión
```

## Visión General de la Arquitectura

Este proyecto implementa una arquitectura dual de autenticación que soporta tanto **OIDC/OAuth 2.0** como **SAML 2.0**, permitiendo a los usuarios elegir su método de autenticación preferido o requerido por su organización.

## Componentes Técnicos

### Frontend (Next.js)
- **Framework**: Next.js 14 con App Router
- **Autenticación**: @okta/okta-auth-js
- **Estado**: React hooks personalizados
- **UI**: Tailwind CSS + shadcn/ui

### Backend (Spring Boot)
- **Framework**: Spring Boot 3
- **Seguridad**: Spring Security 6
- **SAML**: Spring Security SAML2
- **Gestión de Sesiones**:
    - HTTP Sessions (SAML)
    - Stateless JWT (OIDC)

### Proveedor de Identidad
- **Okta**: Configurado para ambos protocolos
    - **OIDC**: Authorization Server
    - **SAML**: Identity Provider (IdP)