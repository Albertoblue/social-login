// Configuración estándar recomendada por el proveedor
export const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SCH6BvEpP",
    client_id: "7g2qqurodeum6tc2h6e57vuec",
    redirect_uri: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/cognito/callback`,
    response_type: "code",
    scope: "email openid profile",
    // Configuraciones adicionales para Next.js
    post_logout_redirect_uri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    automaticSilentRenew: true,
    silent_redirect_uri: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/silent-callback`,
    loadUserInfo: true,
}

// Validar configuración
if (typeof window !== "undefined") {
    const missing = Object.entries(cognitoAuthConfig)
        .filter(([key, value]) => !value && key !== "post_logout_redirect_uri" && key !== "silent_redirect_uri")
        .map(([key]) => key)

    if (missing.length > 0) {
        console.warn("⚠️ Missing Cognito configuration:", missing)
    } else {
        console.log("✅ Cognito standard configuration loaded successfully")
    }
}
