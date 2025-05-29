"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SAMLLoginPage() {
    const router = useRouter()

    useEffect(() => {
        // Esta página simplemente redirige al endpoint de inicio de SAML
        const initiateLogin = async () => {
            try {
                // Redirigir al endpoint del backend que inicia el flujo SAML
                window.location.href = "/api/saml/login"
            } catch (error) {
                console.error("Error iniciando flujo SAML:", error)
                router.push("/?error=saml_initiation_failed")
            }
        }

        initiateLogin()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">Iniciando autenticación SAML</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Redirigiendo a Okta para autenticación SAML...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
