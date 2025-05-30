"use client"

import { useState, useEffect, useCallback } from "react"
import cognitoConfig, {
    getCognitoAuthUrl,
    getCognitoTokenUrl,
    getCognitoUserInfoUrl,
    getCognitoLogoutUrl,
} from "@/lib/cognito-config"

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

    // Función para intercambiar código por tokens
    const exchangeCodeForTokens = useCallback(async (code: string, state: string): Promise<CognitoTokens | null> => {
        try {
            // Validar state
            const savedState = sessionStorage.getItem("cognito_state")
            if (savedState !== state) {
                throw new Error("Invalid state parameter")
            }

            const tokenUrl = getCognitoTokenUrl()
            const redirectUri = cognitoConfig.redirectUri

            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: cognitoConfig.clientId,
                    code: code,
                    redirect_uri: redirectUri,
                }),
            })

            if (!response.ok) {
                const errorData = await response.text()
                throw new Error(`Token exchange failed: ${errorData}`)
            }

            const tokens: CognitoTokens = await response.json()

            // Guardar tokens en localStorage
            localStorage.setItem("cognito_tokens", JSON.stringify(tokens))
            localStorage.setItem("cognito_token_timestamp", Date.now().toString())

            return tokens
        } catch (error: any) {
            console.error("Error exchanging code for tokens:", error)
            setError(error.message)
            return null
        }
    }, [])

    // Función para obtener información del usuario
    const fetchUserInfo = useCallback(async (accessToken: string): Promise<CognitoUser | null> => {
        try {
            const userInfoUrl = getCognitoUserInfoUrl()

            const response = await fetch(userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch user info")
            }

            const userInfo: CognitoUser = await response.json()
            return userInfo
        } catch (error: any) {
            console.error("Error fetching user info:", error)
            setError(error.message)
            return null
        }
    }, [])

    // Función para validar token con el backend
    const validateWithBackend = useCallback(async (token: string): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

            const response = await fetch(`${apiUrl}/auth/validate-cognito`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Cognito token validado con backend:", result)
                setBackendValidated(true)
                return true
            } else {
                console.error("❌ Backend rechazó el token de Cognito")
                setBackendValidated(false)
                setError("El servidor no pudo validar tu token de Cognito")
                return false
            }
        } catch (error) {
            console.error("❌ Error validando token de Cognito con backend:", error)
            setBackendValidated(false)
            setError("Error de conexión con el servidor")
            return false
        }
    }, [])

    // Función para verificar si hay tokens válidos almacenados
    const checkStoredTokens = useCallback(async () => {
        try {
            const storedTokens = localStorage.getItem("cognito_tokens")
            const tokenTimestamp = localStorage.getItem("cognito_token_timestamp")

            if (!storedTokens || !tokenTimestamp) {
                setLoading(false)
                return
            }

            const tokens: CognitoTokens = JSON.parse(storedTokens)
            const timestamp = Number.parseInt(tokenTimestamp)
            const now = Date.now()
            const tokenAge = (now - timestamp) / 1000 // en segundos

            // Verificar si el token ha expirado
            if (tokenAge >= tokens.expires_in) {
                console.log("🕐 Token de Cognito expirado, limpiando...")
                localStorage.removeItem("cognito_tokens")
                localStorage.removeItem("cognito_token_timestamp")
                setLoading(false)
                return
            }

            // Token válido, obtener información del usuario
            const userInfo = await fetchUserInfo(tokens.access_token)
            if (userInfo) {
                setUser(userInfo)
                setAccessToken(tokens.access_token)

                // Validar con backend
                await validateWithBackend(tokens.access_token)
            }

            setLoading(false)
        } catch (error: any) {
            console.error("Error checking stored tokens:", error)
            setError(error.message)
            setLoading(false)
        }
    }, [fetchUserInfo, validateWithBackend])

    // Función para iniciar sesión
    const signIn = useCallback(() => {
        try {
            setLoading(true)
            setError(null)
            const authUrl = getCognitoAuthUrl()
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
            // Limpiar almacenamiento local
            localStorage.removeItem("cognito_tokens")
            localStorage.removeItem("cognito_token_timestamp")
            sessionStorage.removeItem("cognito_state")

            // Limpiar estado
            setUser(null)
            setAccessToken(null)
            setBackendValidated(false)
            setError(null)

            // Redirigir a logout de Cognito
            const logoutUrl = getCognitoLogoutUrl()
            window.location.href = logoutUrl
        } catch (error: any) {
            console.error("Error cerrando sesión:", error)
            setError(error.message)
        }
    }, [])

    // Función para manejar el callback
    const handleCallback = useCallback(
        async (code: string, state: string) => {
            try {
                setLoading(true)
                setError(null)

                const tokens = await exchangeCodeForTokens(code, state)
                if (!tokens) {
                    throw new Error("Failed to exchange code for tokens")
                }

                const userInfo = await fetchUserInfo(tokens.access_token)
                if (!userInfo) {
                    throw new Error("Failed to fetch user info")
                }

                setUser(userInfo)
                setAccessToken(tokens.access_token)

                // Validar con backend
                await validateWithBackend(tokens.access_token)

                setLoading(false)
                return true
            } catch (error: any) {
                console.error("Error in callback:", error)
                setError(error.message)
                setLoading(false)
                return false
            }
        },
        [exchangeCodeForTokens, fetchUserInfo, validateWithBackend],
    )

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

    return {
        user,
        accessToken,
        loading,
        error,
        isAuthenticated: !!user && backendValidated,
        backendValidated,
        signIn,
        signOut,
        handleCallback,
        authenticatedFetch,
    }
}
