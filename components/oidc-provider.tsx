"use client"

import type React from "react"
import { AuthProvider } from "react-oidc-context"
import { cognitoOidcConfig } from "@/lib/oidc-config"

interface OidcProviderProps {
    children: React.ReactNode
}

export function OidcProvider({ children }: OidcProviderProps) {
    const onSigninCallback = () => {
        // Redirigir al dashboard después del login exitoso
        window.history.replaceState({}, document.title, window.location.pathname)
        window.location.href = "/dashboard"
    }

    const onSignoutCallback = () => {
        // Limpiar estado y redirigir al home
        window.history.replaceState({}, document.title, "/")
        window.location.href = "/"
    }

    return (
        <AuthProvider {...cognitoOidcConfig} onSigninCallback={onSigninCallback} onSignoutCallback={onSignoutCallback}>
            {children}
        </AuthProvider>
    )
}
