"use client"

import type React from "react"
import { AuthProvider } from "react-oidc-context"
import { cognitoAuthConfig } from "@/lib/cognito-standard-config"

interface CognitoStandardProviderProps {
    children: React.ReactNode
}

export function CognitoStandardProvider({ children }: CognitoStandardProviderProps) {
    const onSigninCallback = () => {
        // Limpiar la URL después del callback
        window.history.replaceState({}, document.title, window.location.pathname)
        console.log("✅ Cognito signin callback completed")
    }

    const onSignoutCallback = () => {
        // Limpiar estado y redirigir al home
        window.history.replaceState({}, document.title, "/")
        console.log("✅ Cognito signout callback completed")
    }

    return (
        <AuthProvider {...cognitoAuthConfig} onSigninCallback={onSigninCallback} onSignoutCallback={onSignoutCallback}>
            {children}
        </AuthProvider>
    )
}
