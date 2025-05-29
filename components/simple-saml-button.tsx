"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SimpleSAMLButtonProps {
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    idpName?: string
    samlLoginUrl?: string
}

export function SimpleSAMLButton({
                                     className = "",
                                     variant = "outline",
                                     size = "default",
                                     idpName = "Okta (SAML)",
                                     // Modificar la URL por defecto para incluir el dominio del backend
                                     samlLoginUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/saml/login`,
                                 }: SimpleSAMLButtonProps) {
    const [error, setError] = useState<string | null>(null)

    const handleSAMLLogin = () => {
        try {
            setError(null)
            console.log("Iniciando login SAML con URL:", samlLoginUrl)
            // Redirección directa sin estado de loading
            window.location.href = samlLoginUrl
        } catch (err) {
            console.error("Error iniciando login SAML:", err)
            setError(err instanceof Error ? err.message : "Error iniciando login SAML")
        }
    }

    return (
        <>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button variant={variant} size={size} className={className} onClick={handleSAMLLogin} type="button">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"
                        fill="currentColor"
                    />
                </svg>
                Continuar con {idpName}
            </Button>
        </>
    )
}
