import { OktaAuth } from "@okta/okta-auth-js"

// Verificar que las variables de entorno estén disponibles
const issuer = process.env.NEXT_PUBLIC_OKTA_ISSUER
const clientId = process.env.NEXT_PUBLIC_OKTA_CLIENT_ID

if (!issuer) {
    throw new Error("NEXT_PUBLIC_OKTA_ISSUER environment variable is required")
}

if (!clientId) {
    throw new Error("NEXT_PUBLIC_OKTA_CLIENT_ID environment variable is required")
}

// Formatear el issuer correctamente
const formattedIssuer = issuer.endsWith("/oauth2/default") ? issuer : `${issuer}/oauth2/default`

// Solo mostrar logs en desarrollo y en el cliente
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Okta Config - Original Issuer:", issuer)
    console.log("Okta Config - Formatted Issuer:", formattedIssuer)
    console.log("Okta Config - Client ID:", clientId ? "✓ Present" : "✗ Missing")
}

const oktaAuth = new OktaAuth({
    issuer: formattedIssuer,
    clientId: clientId,
    redirectUri: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/callback`,
    scopes: ["openid", "profile", "email"],
    pkce: true,
    responseType: "code",
    responseMode: "query",
    devMode: process.env.NODE_ENV === "development",
})

export default oktaAuth
