"use client"

import { useState, useEffect, useCallback } from "react"
import oktaAuth from "@/lib/okta-config"
import type { AuthState, UserClaims, AccessToken } from "@okta/okta-auth-js"

export function useOktaAuth() {
    const [authState, setAuthState] = useState<AuthState | null>(null)
    const [user, setUser] = useState<UserClaims | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isHydrated, setIsHydrated] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [backendValidated, setBackendValidated] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
    }, [])

    // Función para validar con el backend - MOVIDA FUERA DEL useEffect
    const validateWithBackend = useCallback(async (token: string): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

            const response = await fetch(`${apiUrl}/debug/validation-process`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Token validado con backend:", result)
                setBackendValidated(true)
                return true
            } else {
                console.error("❌ Backend rechazó el token")
                setBackendValidated(false)
                setError("El servidor no pudo validar tu token")
                return false
            }
        } catch (error) {
            console.error("❌ Error validando con backend:", error)
            setBackendValidated(false)
            setError("Error de conexión con el servidor")
            return false
        }
    }, [])

    useEffect(() => {
        if (!isHydrated) return

        const updateAuthState = async () => {
            const newAuthState = oktaAuth.authStateManager.getAuthState()
            setAuthState(newAuthState)
            setUser(newAuthState?.isAuthenticated ? newAuthState.idToken?.claims || null : null)

            // Obtener access token
            if (newAuthState?.isAuthenticated) {
                try {
                    const token = (await oktaAuth.tokenManager.get("accessToken")) as AccessToken
                    const tokenValue = token?.accessToken || null
                    setAccessToken(tokenValue)

                    // Validar automáticamente con el backend cuando hay token
                    if (tokenValue && !backendValidated) {
                        await validateWithBackend(tokenValue)
                    }
                } catch (error) {
                    console.error("Error getting access token:", error)
                    setAccessToken(null)
                    setBackendValidated(false)
                }
            } else {
                setAccessToken(null)
                setBackendValidated(false)
            }

            setLoading(false)
            setError(null)
        }

        // Suscribirse a cambios en el estado de autenticación
        oktaAuth.authStateManager.subscribe(updateAuthState)

        // Verificar estado inicial
        if (oktaAuth.isLoginRedirect()) {
            // No hacer nada aquí, el callback page se encarga
            setLoading(false)
        } else {
            updateAuthState()
        }

        return () => {
            oktaAuth.authStateManager.unsubscribe(updateAuthState)
        }
    }, [isHydrated, backendValidated, validateWithBackend])

    const signIn = async () => {
        try {
            setLoading(true)
            setError(null)
            setBackendValidated(false) // Reset validation state
            await oktaAuth.signInWithRedirect()
        } catch (error: any) {
            console.error("Error en login con Okta:", error)
            setError(`Error de autenticación: ${error.message}`)
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            setError(null)
            setBackendValidated(false) // Reset validation state
            await oktaAuth.signOut()
            setAccessToken(null)
        } catch (error: any) {
            console.error("Error en logout:", error)
            setError(`Error al cerrar sesión: ${error.message}`)
            setLoading(false)
        }
    }

    // Función para hacer peticiones autenticadas
    const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
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

        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (response.status === 401) {
            // Token expirado o inválido
            setBackendValidated(false)
            try {
                await oktaAuth.tokenManager.renew("accessToken")
                const newToken = (await oktaAuth.tokenManager.get("accessToken")) as AccessToken
                setAccessToken(newToken?.accessToken || null)

                // Revalidar con backend - AHORA SÍ ESTÁ DISPONIBLE
                if (newToken?.accessToken) {
                    const isValid = await validateWithBackend(newToken.accessToken)
                    if (!isValid) {
                        throw new Error("New token validation failed")
                    }
                }

                // Reintentar la petición con el nuevo token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${newToken?.accessToken}`,
                    },
                })
            } catch (error) {
                console.error("Error renovando token:", error)
                throw new Error("Token expired and renewal failed")
            }
        }

        return response
    }

    return {
        authState,
        user,
        accessToken,
        loading: loading || !isHydrated,
        isAuthenticated: authState?.isAuthenticated && backendValidated,
        backendValidated,
        error,
        signIn,
        signOut,
        authenticatedFetch,
        validateWithBackend, // Exportar la función por si la necesitas externamente
    }
}
