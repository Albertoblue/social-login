"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { decodeJWT, getJWTFromURL, type JWTPayload } from "@/lib/utils"

export default function SAMLCallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState<string>("Procesando autenticación SAML...")

    useEffect(() => {
        console.log("🔄 Procesando callback SAML...")

        // Intentar obtener JWT desde la URL
        const jwtToken = getJWTFromURL()
        
        if (jwtToken) {
            console.log("🔍 JWT encontrado en URL:", jwtToken.substring(0, 50) + "...")
            
            // Decodificar el JWT
            const jwtPayload = decodeJWT(jwtToken)
            
            if (jwtPayload) {
                console.log("✅ JWT decodificado exitosamente:", jwtPayload)
                
                setStatus("success")
                setMessage("Autenticación SAML completada. Redirigiendo al dashboard...")

                // Guardar estado de autenticación y datos del JWT en localStorage
                localStorage.setItem("saml_authenticated", "true")
                localStorage.setItem("saml_jwt_payload", JSON.stringify(jwtPayload))
                localStorage.setItem("saml_jwt_token", jwtToken) // Guardar el token raw para validación
                
                // Usar email del JWT si está disponible
                const userEmail = jwtPayload.email || jwtPayload.sub || "usuario@saml.com"
                localStorage.setItem("saml_user", userEmail)

                // Redirigir al dashboard
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1500)
            } else {
                console.error("❌ Error decodificando JWT")
                setStatus("error")
                setMessage("Error procesando token SAML. El token no es válido.")
            }
        } else {
            // Fallback: simular autenticación exitosa si no hay JWT
            console.log("⚠️ No se encontró JWT en URL, simulando autenticación...")
            
            setTimeout(() => {
                console.log("✅ Autenticación SAML simulada exitosa")
                setStatus("success")
                setMessage("Autenticación SAML completada. Redirigiendo al dashboard...")

                localStorage.setItem("saml_authenticated", "true")
                localStorage.setItem("saml_user", "usuario@ejemplo.com")

                setTimeout(() => {
                    router.push("/dashboard")
                }, 1500)
            }, 2000)
        }
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
