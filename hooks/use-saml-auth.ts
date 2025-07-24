"use client"

import { useState, useEffect, useCallback } from "react"
import { type JWTPayload } from "@/lib/utils"

interface SAMLAuthState {
    isAuthenticated: boolean
    loading: boolean
    error: string | null
    user: string | null
    jwtPayload: JWTPayload | null
    rawToken: string | null
}

export function useSAMLAuth() {
    const [state, setState] = useState<SAMLAuthState>({
        isAuthenticated: false,
        loading: true,
        error: null,
        user: null,
        jwtPayload: null,
        rawToken: null,
    })

    // Verificar autenticación desde localStorage
    const checkAuth = useCallback(() => {
        if (typeof window === "undefined") return

        const isAuthenticated = localStorage.getItem("saml_authenticated") === "true"
        const user = localStorage.getItem("saml_user")
        const jwtPayloadStr = localStorage.getItem("saml_jwt_payload")
        const rawToken = localStorage.getItem("saml_jwt_token")
        
        let jwtPayload: JWTPayload | null = null
        if (jwtPayloadStr) {
            try {
                jwtPayload = JSON.parse(jwtPayloadStr)
            } catch (error) {
                console.error("Error parsing JWT payload from localStorage:", error)
            }
        }

        setState({
            isAuthenticated,
            loading: false,
            error: null,
            user,
            jwtPayload,
            rawToken,
        })

        console.log("🔍 Estado SAML verificado:", { isAuthenticated, user, jwtPayload })
    }, []) // Sin dependencias para evitar ciclos

    // Iniciar login SAML
    const loginWithSAML = useCallback(() => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            console.log("🚀 Iniciando login SAML:", `${apiUrl}/api/saml/login`)

            // Redirigir al endpoint de login SAML del backend
            window.location.href = `${apiUrl}/api/saml/login`
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: "Error iniciando login SAML",
            }))
        }
    }, [])

    // Cerrar sesión
    const logoutFromSAML = useCallback(() => {
        localStorage.removeItem("saml_authenticated")
        localStorage.removeItem("saml_user")
        localStorage.removeItem("saml_jwt_payload")
        localStorage.removeItem("saml_jwt_token")

        setState({
            isAuthenticated: false,
            loading: false,
            error: null,
            user: null,
            jwtPayload: null,
            rawToken: null,
        })

        console.log("🚪 Sesión SAML cerrada")
    }, [])

    // Verificar autenticación al montar (solo una vez)
    useEffect(() => {
        checkAuth()
    }, []) // Array vacío para ejecutar solo una vez

    return {
        ...state,
        loginWithSAML,
        logoutFromSAML,
        checkSAMLSession: checkAuth,
        samlAttributes: state.jwtPayload || (state.user ? { email: state.user } : null),
    }
}
