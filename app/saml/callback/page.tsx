"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function SAMLCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState<string>("Procesando autenticación SAML...")

    useEffect(() => {
        // Simular autenticación exitosa después de un breve delay
        console.log("🔄 Procesando callback SAML...")

        // Simular éxito después de 2 segundos
        setTimeout(() => {
            console.log("✅ Autenticación SAML simulada exitosa")
            setStatus("success")
            setMessage("Autenticación SAML completada. Redirigiendo al dashboard...")

            // Guardar estado de autenticación en localStorage
            localStorage.setItem("saml_authenticated", "true")
            localStorage.setItem("saml_user", "usuario@ejemplo.com")

            // Redirigir al dashboard
            setTimeout(() => {
                router.push("/dashboard")
            }, 1500)
        }, 2000)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        {status === "loading" && "Procesando autenticación SAML..."}
                        {status === "success" && "Autenticación Exitosa"}
                        {status === "error" && "Error de Autenticación"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === "loading" && (
                        <div className="flex flex-col items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Procesando respuesta SAML...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">{message}</AlertDescription>
                        </Alert>
                    )}

                    {status === "error" && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
