interface CognitoConfig {
    userPoolId: string
    clientId: string
    region: string
    authority: string
    redirectUri: string
    scope: string
}

const cognitoConfig: CognitoConfig = {
    userPoolId: "us-east-1_SCH6BvEpP",
    clientId: "7g2qqurodeum6tc2h6e57vuec",
    region: "us-east-1",
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SCH6BvEpP",
    redirectUri: "https://d84l1y8p4kdic.cloudfront.net/cognito/callback",
    scope: "phone openid email",
}

// Validar configuración
if (typeof window !== "undefined") {
    const missing = Object.entries(cognitoConfig)
        .filter(([key, value]) => !value)
        .map(([key]) => key)

    if (missing.length > 0) {
        console.warn("⚠️ Missing Cognito configuration:", missing)
    } else {
        console.log("✅ Cognito configuration loaded successfully")
    }
}

// Extraer el dominio de Cognito de la URL de autoridad
const extractCognitoDomain = (): string => {
    // Intentar extraer el dominio del User Pool ID
    const userPoolId = cognitoConfig.userPoolId
    const region = cognitoConfig.region

    // Formato estándar de dominio de Cognito
    return `${userPoolId.split("_")[1].toLowerCase()}.auth.${region}.amazoncognito.com`
}

export const getCognitoAuthUrl = () => {
    const { clientId, scope, redirectUri } = cognitoConfig
    const domain = extractCognitoDomain()
    const responseType = "code"
    const state = Math.random().toString(36).substring(2, 15)

    // Guardar el state para validación posterior
    sessionStorage.setItem("cognito_state", state)

    return (
        `https://${domain}/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `response_type=${responseType}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`
    )
}

export const getCognitoTokenUrl = () => {
    const domain = extractCognitoDomain()
    return `https://${domain}/oauth2/token`
}

export const getCognitoUserInfoUrl = () => {
    const domain = extractCognitoDomain()
    return `https://${domain}/oauth2/userInfo`
}

export const getCognitoLogoutUrl = () => {
    const { clientId, redirectUri } = cognitoConfig
    const domain = extractCognitoDomain()
    const logoutUri = encodeURIComponent(redirectUri.split("/cognito")[0])

    return `https://${domain}/logout?` + `client_id=${clientId}&` + `logout_uri=${logoutUri}`
}

export default cognitoConfig
