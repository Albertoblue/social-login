"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface SAMLAuthState {
    isAuthenticated: boolean
    loading: boolean
    error: string | null
    samlResponse: any | null
    samlAttributes: Record<string, string> | null
}

interface UseSAMLAuthOptions {
    samlEndpoint?: string
    samlLoginUrl?: string
    samlLogoutUrl?: string
    onSuccess?: (response: any) => void
    onError?: (error: any) => void
}

const initialState: SAMLAuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
    samlResponse: null,
    samlAttributes: null,
}

export function useSAMLAuth(options: UseSAMLAuthOptions = {}) {
    const {
        samlEndpoint = "/api/saml",
        samlLoginUrl = "/api/saml/login",
        samlLogoutUrl = "/api/saml/logout",
        onSuccess,
        onError,
    } = options

    const [state, setState] = useState<SAMLAuthState>(initialState)
    const onSuccessRef = useRef(onSuccess)
    const onErrorRef = useRef(onError)
    const isCheckingRef = useRef(false)
    const isMountedRef = useRef(true)

    useEffect(() => {
        onSuccessRef.current = onSuccess
        onErrorRef.current = onError

        return () => {
            isMountedRef.current = false
        }
    }, [onSuccess, onError])

    // Verificar estado de autenticación SAML
    const checkSAMLSession = useCallback(async () => {
        if (isCheckingRef.current || !isMountedRef.current) {
            return
        }

        isCheckingRef.current = true

        try {
            setState((prev) => ({ ...prev, loading: true, error: null }))

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            // Usar /status en lugar de /session para mejor información
            const response = await fetch(`${apiUrl}${samlEndpoint}/status`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!isMountedRef.current) return

            if (response.ok) {
                const data = await response.json()
                const isAuthenticated = data.currently_authenticated || data.has_session

                setState({
                    isAuthenticated,
                    loading: false,
                    error: null,
                    samlResponse: data.samlResponse || null,
                    samlAttributes: data.attributes || null,
                })

                console.log("🔍 Estado SAML:", data)

                if (isAuthenticated && onSuccessRef.current) {
                    onSuccessRef.current(data)
                }
            } else {
                console.error("❌ Error verificando estado SAML:", response.status)
                setState((prev) => ({
                    ...prev,
                    isAuthenticated: false,
                    loading: false,
                    error: `Error verificando sesión SAML: ${response.status}`,
                }))
            }
        } catch (error) {
            if (!isMountedRef.current) return

            console.error("❌ Error verificando sesión SAML:", error)
            setState((prev) => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            }))

            if (onErrorRef.current) {
                onErrorRef.current(error)
            }
        } finally {
            isCheckingRef.current = false
        }
    }, [samlEndpoint])

    // Iniciar login SAML
    const loginWithSAML = useCallback(() => {
        try {
            setState((prev) => ({ ...prev, error: null }))

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            console.log("🚀 Iniciando login SAML:", `${apiUrl}${samlLoginUrl}`)

            // Redirigir al endpoint de login SAML del backend
            window.location.href = `${apiUrl}${samlLoginUrl}`
        } catch (error) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Error iniciando redirección SAML",
            }))
        }
    }, [samlLoginUrl])

    // Cerrar sesión SAML
    const logoutFromSAML = useCallback(async () => {
        if (!isMountedRef.current) return

        try {
            setState((prev) => ({ ...prev, loading: true, error: null }))
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${apiUrl}${samlLogoutUrl}`, {
                method: "POST",
                credentials: "include",
            })

            if (!isMountedRef.current) return

            if (response.ok) {
                setState({
                    isAuthenticated: false,
                    loading: false,
                    error: null,
                    samlResponse: null,
                    samlAttributes: null,
                })
            } else {
                const error = await response.text()
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: `Error en logout SAML: ${error}`,
                }))
            }
        } catch (error) {
            if (!isMountedRef.current) return

            console.error("Error en logout SAML:", error)
            setState((prev) => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            }))
        }
    }, [samlLogoutUrl])

    // Procesar respuesta SAML (para página de callback)
    const processSAMLResponse = useCallback(
        async (samlResponse: string) => {
            // Esta función ya no es necesaria porque el backend maneja todo
            // Simplemente verificamos el estado
            await checkSAMLSession()
        },
        [checkSAMLSession],
    )

    // Verificar sesión al montar
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Pequeño delay para evitar race conditions
            setTimeout(() => {
                checkSAMLSession()
            }, 100)
        }

        return () => {
            isMountedRef.current = false
        }
    }, [checkSAMLSession])

    return {
        ...state,
        loginWithSAML,
        logoutFromSAML,
        checkSAMLSession,
        processSAMLResponse,
    }
}
