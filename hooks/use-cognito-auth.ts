"use client"

import { useState, useEffect, useCallback } from "react"

interface CognitoUser {
    sub: string
    email: string
    email_verified: boolean
    phone_number?: string
    name?: string
    given_name?: string
    family_name?: string
    picture?: string
}

interface CognitoTokens {
    access_token: string
    id_token: string
    refresh_token: string
    token_type: string
    expires_in: number
}

export function useCognitoAuth() {
    const [user, setUser] = useState<CognitoUser | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [backendValidated, setBackendValidated] = useState(false)

    // Función para iniciar sesión
    const signIn = useCallback(() => {
        try {
            setLoading(true)
            setError(null)

            const baseUrl = "https://sch6bvepp.auth.us-east-1.amazoncognito.com"
            const clientId = "7g2qqurodeum6tc2h6e57vuec"
            const redirectUri = encodeURIComponent("http://localhost:3000/cognito/callback")
            const scope = encodeURIComponent("phone openid email")

            const authUrl =
                `${baseUrl}/oauth2/authorize?` +
                `response_type=code&` +
                `client_id=${clientId}&` +
                `redirect_uri=${redirectUri}&` +
                `scope=${scope}`

            console.log("🔄 Redirigiendo a Cognito:", authUrl)
            window.location.href = authUrl
        } catch (error: any) {
            console.error("Error iniciando sesión con Cognito:", error)
            setError(error.message)
            setLoading(false)
        }
    }, [])

    // Función para cerrar sesión
    const signOut = useCallback(() => {
        try {
            // Limpiar almacenamiento
            localStorage.removeItem("cognito_tokens")
            localStorage.removeItem("cognito_user")
            localStorage.removeItem("cognito_token_timestamp")
            localStorage.removeItem("cognito_backend_validated")

            // Limpiar estado
            setUser(null)
            setAccessToken(null)
            setBackendValidated(false)
            setError(null)

            // Redirigir a logout de Cognito
            const baseUrl = "https://sch6bvepp.auth.us-east-1.amazoncognito.com"
            const clientId = "7g2qqurodeum6tc2h6e57vuec"
            const logoutUri = encodeURIComponent(window.location.origin)

            const logoutUrl = `${baseUrl}/logout?` + `client_id=${clientId}&` + `logout_uri=${logoutUri}`

            window.location.href = logoutUrl
        } catch (error: any) {
            console.error("Error cerrando sesión:", error)
            setError(error.message)
        }
    }, [])

    // Función para recargar manualmente el estado (útil después del callback)
    const reloadAuthState = useCallback(async () => {
        console.log("🔄 Recargando estado de autenticación de Cognito...")
        await checkStoredTokens()
    }, [])

    // Verificar tokens almacenados al cargar
    const checkStoredTokens = useCallback(async () => {
        try {
            console.log("🔍 Verificando tokens almacenados de Cognito...")

            const storedTokens = localStorage.getItem("cognito_tokens")
            const storedUser = localStorage.getItem("cognito_user")
            const tokenTimestamp = localStorage.getItem("cognito_token_timestamp")
            const backendValidatedFlag = localStorage.getItem("cognito_backend_validated")

            console.log("📊 Estado del localStorage:", {
                hasTokens: !!storedTokens,
                hasUser: !!storedUser,
                hasTimestamp: !!tokenTimestamp,
                backendValidated: backendValidatedFlag,
            })

            if (!storedTokens || !storedUser || !tokenTimestamp || !backendValidatedFlag) {
                console.log("❌ Datos incompletos en localStorage para Cognito")
                setLoading(false)
                return
            }

            const tokens: CognitoTokens = JSON.parse(storedTokens)
            const userInfo: CognitoUser = JSON.parse(storedUser)
            const timestamp = Number.parseInt(tokenTimestamp)
            const now = Date.now()
            const tokenAge = (now - timestamp) / 1000 // en segundos

            console.log("⏰ Información del token:", {
                tokenAge: Math.round(tokenAge),
                expiresIn: tokens.expires_in,
                isExpired: tokenAge >= tokens.expires_in,
            })

            // Verificar si el token ha expirado
            if (tokenAge >= tokens.expires_in) {
                console.log("🕐 Token de Cognito expirado, limpiando...")
                localStorage.removeItem("cognito_tokens")
                localStorage.removeItem("cognito_user")
                localStorage.removeItem("cognito_token_timestamp")
                localStorage.removeItem("cognito_backend_validated")
                setLoading(false)
                return
            }

            // Token válido, restaurar estado
            console.log("✅ Restaurando estado de Cognito:", {
                user: userInfo.email,
                tokenLength: tokens.access_token.length,
                backendValidated: true
            })
            setUser(userInfo)
            setAccessToken(tokens.access_token)
            setBackendValidated(true)

            console.log("✅ Sesión de Cognito restaurada exitosamente:", {
                user: userInfo.email || userInfo.sub,
                tokenAge: Math.round(tokenAge),
                expiresIn: tokens.expires_in,
                backendValidated: true,
            })

            setLoading(false)
        } catch (error: any) {
            console.error("❌ Error verificando tokens almacenados:", error)
            setError(error.message)
            setLoading(false)
        }
    }, [])

    // Función para hacer peticiones autenticadas
    const authenticatedFetch = useCallback(
        async (url: string, options: RequestInit = {}) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }

            if (!backendValidated) {
                throw new Error("Token not validated by backend")
            }

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                ...options.headers,
            }

            return fetch(url, {
                ...options,
                headers,
            })
        },
        [accessToken, backendValidated],
    )

    // Verificar tokens almacenados al cargar
    useEffect(() => {
        checkStoredTokens()
    }, [checkStoredTokens])

    // Escuchar cambios en localStorage (útil para sincronizar entre pestañas)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "cognito_tokens" || e.key === "cognito_user" || e.key === "cognito_backend_validated") {
                console.log("🔄 Cambio detectado en localStorage, recargando estado...")
                checkStoredTokens()
            }
        }

        const handleAuthSuccess = () => {
            console.log("🔄 Evento cognito-auth-success recibido, recargando estado...")
            checkStoredTokens()
        }

        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("cognito-auth-success", handleAuthSuccess)
        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("cognito-auth-success", handleAuthSuccess)
        }
    }, [checkStoredTokens])

    return {
        user,
        accessToken,
        loading,
        error,
        isAuthenticated: !!user && !!accessToken && backendValidated,
        backendValidated,
        signIn,
        signOut,
        authenticatedFetch,
        reloadAuthState, // Nueva función para recargar manualmente
    }
}
