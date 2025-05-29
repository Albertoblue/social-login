"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SAMLCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState("Procesando autenticación SAML...")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const handleSAMLCallback = async () => {
            try {
                // Verificar si viene de un callback exitoso
                const successParam = searchParams.get("success")
                const errorParam = searchParams.get("error")

                if (successParam === "true") {
                    setStatus("¡Autenticación SAML exitosa!")
                    setSuccess(true)

                    // Redirigir al dashboard después de un momento
                    setTimeout(() => {
                        router.push("/dashboard")
                    }, 2000)
                } else if (errorParam) {
                    const details = searchParams.get("details") || "Error desconocido"
                    setError(`Error SAML: ${errorParam} - ${details}`)
                    setStatus("Error en la autenticación")

                    // Redirigir al login después de un momento
                    setTimeout(() => {
                        router.push("/?error=saml_callback_error")
                    }, 3000)
                } else {
                    // Si no hay parámetros claros, verificar sesión SAML
                    setStatus("Verificando sesión SAML...")
                    await checkSAMLSession()
                }
            } catch (error) {
                console.error("Error en callback SAML:", error)
                setError(error instanceof Error ? error.message : "Error desconocido")
                setStatus("Error procesando callback")

                setTimeout(() => {
                    router.push("/?error=saml_processing_error")
                }, 3000)
            }
        }

        const checkSAMLSession = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
                const response = await fetch(`${apiUrl}/api/saml/session`, {
                    credentials: "include",
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.authenticated) {
                        setStatus("¡Sesión SAML verificada!")
                        setSuccess(true)
                        setTimeout(() => {
                            router.push("/dashboard")
                        }, 1500)
                    } else {
                        throw new Error("Sesión SAML no encontrada")
                    }
                } else {
                    throw new Error("Error verificando sesión SAML")
                }
            } catch (error) {
                console.error("Error verificando sesión SAML:", error)
                setError("No se pudo verificar la sesión SAML")
                setTimeout(() => {
                    router.push("/?error=saml_session_error")
                }, 3000)
            }
        }

        handleSAMLCallback()
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">
                        {success ? "¡Autenticación Exitosa!" : "Procesando SAML"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        {success ? (
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        ) : (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        )}
                        <p className="text-gray-600 mb-4">{status}</p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                            <p className="text-sm mt-1">Serás redirigido al login en unos segundos...</p>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700">
                                Autenticación SAML completada. Redirigiendo al dashboard...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Información de progreso */}
                    <div className="text-sm text-gray-500">
                        <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Respuesta SAML recibida</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${success ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <span>Sesión establecida</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${success ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <span>Acceso autorizado</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
