"use client"

import { useAuth } from "react-oidc-context"
import { useEffect, useState } from "react"

interface AuthError {
    message: string
    type: "signin" | "signout" | "token_refresh" | "general"
    timestamp: Date
}

export function useAuthWithErrors() {
    const auth = useAuth()
    const [authError, setAuthError] = useState<AuthError | null>(null)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)

    // Auto-limpiar errores después de 10 segundos
    useEffect(() => {
        if (authError) {
            const timer = setTimeout(() => {
                setAuthError(null)
            }, 10000)

            return () => clearTimeout(timer)
        }
    }, [authError])

    // Función para iniciar sesión
    const signInWithErrorHandling = async () => {
        try {
            setIsSigningIn(true)
            setAuthError(null)
            console.log("🔄 Iniciando proceso de autenticación...")

            await auth.signinRedirect()
        } catch (error: any) {
            console.error("❌ Error durante el inicio de sesión:", error)
            setAuthError({
                message: error.message || "Error desconocido durante el inicio de sesión",
                type: "signin",
                timestamp: new Date(),
            })
            setIsSigningIn(false)
        }
    }

    // Función mejorada para cerrar sesión
    const signOutWithErrorHandling = async () => {
        try {
            setIsSigningOut(true)
            setAuthError(null)
            console.log("🔄 Cerrando sesión...")

            await auth.signoutRedirect()
        } catch (error: any) {
            console.error("❌ Error durante el cierre de sesión:", error)
            setAuthError({
                message: error.message || "Error desconocido durante el cierre de sesión",
                type: "signout",
                timestamp: new Date(),
            })
            setIsSigningOut(false)
        }
    }

    // Función para limpiar errores manualmente
    const clearError = () => {
        setAuthError(null)
    }

    // Función para obtener información del usuario de forma segura
    const getUserInfo = () => {
        try {
            if (!auth.user) return null

            return {
                id: auth.user.profile.sub,
                email: auth.user.profile.email,
                name: auth.user.profile.name || auth.user.profile.preferred_username,
                accessToken: auth.user.access_token,
                idToken: auth.user.id_token,
                expiresAt: auth.user.expires_at,
            }
        } catch (error) {
            console.error("Error al obtener información del usuario:", error)
            return null
        }
    }

    // Función para verificar si el token está próximo a expirar
    const isTokenExpiringSoon = (minutesThreshold = 5) => {
        try {
            if (!auth.user?.expires_at) return false

            const expirationTime = auth.user.expires_at * 1000 // Convertir a millisegundos
            const currentTime = Date.now()
            const thresholdTime = minutesThreshold * 60 * 1000 // Convertir minutos a millisegundos

            return expirationTime - currentTime < thresholdTime
        } catch (error) {
            console.error("Error al verificar expiración del token:", error)
            return false
        }
    }

    return {
        // Estado original de auth
        ...auth,

        // Estados adicionales
        authError,
        isSigningIn,
        isSigningOut,

        signIn: signInWithErrorHandling,
        signOut: signOutWithErrorHandling,
        clearError,
        getUserInfo,
        isTokenExpiringSoon,
        isAuthenticated: Boolean(auth.isAuthenticated),
        isLoading: Boolean(auth.isLoading) || isSigningIn || isSigningOut,
    }
}
