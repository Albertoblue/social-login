import type { UserManagerSettings } from "oidc-client-ts"

// Función para obtener la URL base de la aplicación
const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.origin
    }
    return "https://d84l1y8p4kdic.cloudfront.net" // URL por defecto para SSR
}

export const cognitoOidcConfig: UserManagerSettings = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SCH6BvEpP",
    client_id: "7g2qqurodeum6tc2h6e57vuec",
    redirect_uri: `${getBaseUrl()}/cognito/callback`,
    post_logout_redirect_uri: getBaseUrl(),
    response_type: "code",

    // Simplificar los scopes - solo usar los básicos
    scope: "openid email profile",

    loadUserInfo: true,

    // Configuraciones adicionales para mejorar la compatibilidad
    extraQueryParams: {
        // Eliminar parámetros extra que podrían causar problemas
    },

    // Configuraciones de seguridad
    filterProtocolClaims: true,

}

export default cognitoOidcConfig
