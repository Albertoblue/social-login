"use client"

import { useState, useCallback, SetStateAction} from "react"
import {Button} from "@/components/ui/button"
import {useSAMLAuth} from "@/hooks/use-saml-auth"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription} from "@/components/ui/alert"

interface SAMLLoginButtonProps {
    provider?: string
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    idpName?: string
}

export function SAMLLoginButton({
                                    provider = "okta",
                                    className = "",
                                    variant = "outline",
                                    size = "default",
                                    idpName = "Okta (SAML)",
                                }: SAMLLoginButtonProps) {
    const [error, setError] = useState<string | null>(null)

    // Extraer solo lo que necesitamos del hook para evitar re-renderizados innecesarios
    const {loginWithSAML, loading} = useSAMLAuth()

    // Usar useCallback para evitar recrear la función en cada renderizado
    const handleSAMLLogin = useCallback(async () => {
        try {
            setError(null)
            // No necesitamos await aquí porque loginWithSAML hace una redirección inmediata
            loginWithSAML()
        } catch (err) {
            console.error("Error iniciando login SAML:", err)
            setError(err instanceof Error ? err.message : "Error iniciando login SAML")
        }
    }, [loginWithSAML])

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleSAMLLogin}
                disabled={loading}
                type="button"
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                        fill="currentColor"
                    />
                </svg>
                {loading ? "Redirigiendo..." : `Continuar con ${idpName}`}
            </Button>
        </>
    )
}
