"use client"

import { Button } from "@/components/ui/button"
import { Cloud, Shield } from "lucide-react"
import { useAuthWithErrors } from "@/hooks/use-auth-with-errors"
import { useOktaAuth } from "@/hooks/use-okta-auth"

interface OidcButtonProps {
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function CognitoLoginButton({ className = "", variant = "outline" }: OidcButtonProps) {
    const { signIn, isLoading, isAuthenticated } = useAuthWithErrors()

    // No mostrar el botón si ya está autenticado
    if (isAuthenticated) {
        return null
    }
    return (
        <Button variant={variant} className={`w-full ${className}`} onClick={signIn} disabled={isLoading}>
            <Cloud className="mr-2 h-4 w-4" />
            {isLoading ? "Conectando..." : "Continuar con AWS Cognito"}
        </Button>
    )
}

export function OktaOidcButton({ className = "", variant = "outline" }: OidcButtonProps) {
    const { signIn: oktaSignIn, loading: oktaLoading } = useOktaAuth()

    return (
        <Button variant={variant} className={`w-full ${className}`} onClick={oktaSignIn} disabled={oktaLoading}>
            <Shield className="mr-2 h-4 w-4" />
            {oktaLoading ? "Conectando..." : "Continuar con Okta (OIDC)"}
        </Button>
    )
}
