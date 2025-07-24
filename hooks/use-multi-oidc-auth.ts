"use client"

import { useAuth } from "react-oidc-context"
import { UserManager } from "oidc-client-ts"
import { useState, useCallback, useMemo } from "react"
import { cognitoOidcConfig } from "@/lib/oidc-config"

// Temporary placeholder for Okta config since it's not implemented yet
const oktaOidcConfig = {
    authority: "https://placeholder.okta.com",
    client_id: "placeholder",
    redirect_uri: "http://localhost:3000/okta/callback",
    response_type: "code",
    scope: "openid profile email"
}

type OidcProvider = "cognito" | "okta"

interface MultiOidcAuthState {
    currentProvider: OidcProvider | null
    isAuthenticated: boolean
    user: any
    loading: boolean
    error: string | null
}

export function useMultiOidcAuth() {
    const cognitoAuth = useAuth()
    const [currentProvider, setCurrentProvider] = useState<OidcProvider | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Crear user managers para diferentes proveedores
    const userManagers = useMemo(
        () => ({
            cognito: new UserManager(cognitoOidcConfig),
            okta: new UserManager(oktaOidcConfig),
        }),
        [],
    )

    // Función para iniciar sesión con un proveedor específico
    const signInWithProvider = useCallback(
        async (provider: OidcProvider) => {
            try {
                setLoading(true)
                setError(null)
                setCurrentProvider(provider)

                if (provider === "cognito") {
                    await cognitoAuth.signinRedirect()
                } else if (provider === "okta") {
                    await userManagers.okta.signinRedirect()
                }
            } catch (error: any) {
                console.error(`Error signing in with ${provider}:`, error)
                setError(error.message)
                setLoading(false)
            }
        },
        [cognitoAuth, userManagers],
    )

    // Función para cerrar sesión
    const signOut = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            if (currentProvider === "cognito") {
                await cognitoAuth.signoutRedirect()
            } else if (currentProvider === "okta") {
                await userManagers.okta.signoutRedirect()
            }

            setCurrentProvider(null)
        } catch (error: any) {
            console.error("Error signing out:", error)
            setError(error.message)
            setLoading(false)
        }
    }, [currentProvider, cognitoAuth, userManagers])

    // Función para validar token con backend
    const validateWithBackend = useCallback(async (token: string, provider: OidcProvider): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
            const endpoint = provider === "cognito" ? "validate-cognito" : "validate"

            const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const result = await response.json()
                console.log(`✅ ${provider} token validado con backend:`, result)
                return true
            } else {
                console.error(`❌ Backend rechazó el token de ${provider}`)
                setError(`El servidor no pudo validar tu token de ${provider}`)
                return false
            }
        } catch (error) {
            console.error(`❌ Error validando token de ${provider} con backend:`, error)
            setError("Error de conexión con el servidor")
            return false
        }
    }, [])

    // Función para hacer peticiones autenticadas
    const authenticatedFetch = useCallback(
        async (url: string, options: RequestInit = {}) => {
            const accessToken = cognitoAuth.user?.access_token

            if (!accessToken) {
                throw new Error("No access token available")
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
        [cognitoAuth.user],
    )

    return {
        // Estado actual
        isAuthenticated: cognitoAuth.isAuthenticated,
        user: cognitoAuth.user,
        loading: loading || cognitoAuth.isLoading,
        error: error || cognitoAuth.error?.message || null,
        currentProvider,

        // Funciones
        signInWithCognito: () => signInWithProvider("cognito"),
        signInWithOkta: () => signInWithProvider("okta"),
        signOut,
        authenticatedFetch,
        validateWithBackend,

        // Acceso directo al contexto de Cognito
        cognitoAuth,
    }
}
