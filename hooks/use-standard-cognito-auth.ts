"use client"

import { useAuth } from "react-oidc-context"
import { useCallback } from "react"

export function useStandardCognitoAuth() {
    const auth = useAuth()

    // Función para hacer peticiones autenticadas al backend
    const authenticatedFetch = useCallback(
        async (url: string, options: RequestInit = {}) => {
            if (!auth.user?.access_token) {
                throw new Error("No access token available")
            }

            const headers = {
                Authorization: `Bearer ${auth.user.access_token}`,
                "Content-Type": "application/json",
                ...options.headers,
            }

            return fetch(url, {
                ...options,
                headers,
            })
        },
        [auth.user?.access_token],
    )

    // Función para validar con el backend
    const validateWithBackend = useCallback(async () => {
        if (!auth.user?.access_token) {
            return false
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            const response = await authenticatedFetch(`${apiUrl}/api/auth/validate-cognito`)

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Token validado con backend:", result)
                return true
            }

            return false
        } catch (error) {
            console.error("❌ Error validando con backend:", error)
            return false
        }
    }, [auth.user?.access_token, authenticatedFetch])

    return {
        // Estados del auth context
        user: auth.user,
        isLoading: auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        error: auth.error,

        // Funciones de autenticación
        signIn: () => auth.signinRedirect(),
        signOut: () => auth.signoutRedirect(),

        // Funciones adicionales
        authenticatedFetch,
        validateWithBackend,

        // Información adicional
        accessToken: auth.user?.access_token,
        userInfo: {
            sub: auth.user?.profile?.sub,
            email: auth.user?.profile?.email,
            email_verified: auth.user?.profile?.email_verified,
            name: auth.user?.profile?.name,
            given_name: auth.user?.profile?.given_name,
            family_name: auth.user?.profile?.family_name,
            picture: auth.user?.profile?.picture,
        },
    }
}
