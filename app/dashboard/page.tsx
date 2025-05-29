"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, LogOut } from "lucide-react"
import { useOktaAuth } from "@/hooks/use-okta-auth"
import { useSAMLAuth } from "@/hooks/use-saml-auth"

export default function DashboardPage() {
    const router = useRouter()
    const [debugInfo, setDebugInfo] = useState<any>(null)

    // Hooks de autenticación
    const oktaAuth = useOktaAuth()
    const samlAuth = useSAMLAuth()

    // Estado combinado
    const isAuthenticated = oktaAuth.isAuthenticated || samlAuth.isAuthenticated
    const loading = oktaAuth.loading || samlAuth.loading
    const user = oktaAuth.user || samlAuth.samlAttributes

    useEffect(() => {
        console.log("🏠 Dashboard montado")
        console.log("📊 Estado Okta:", {
            isAuthenticated: oktaAuth.isAuthenticated,
            loading: oktaAuth.loading,
            user: oktaAuth.user,
        })
        console.log("📊 Estado SAML:", {
            isAuthenticated: samlAuth.isAuthenticated,
            loading: samlAuth.loading,
            user: samlAuth.samlAttributes,
        })

        // Verificar sesión manualmente
        checkBackendSession()
    }, [oktaAuth.isAuthenticated, samlAuth.isAuthenticated])

    const checkBackendSession = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            // Verificar sesión SAML
            const samlResponse = await fetch(`${apiUrl}/api/saml/session`, {
                credentials: "include",
            })

            const samlData = samlResponse.ok ? await samlResponse.json() : null

            // Verificar sesión Okta
            const oktaResponse = await fetch(`${apiUrl}/api/auth/validate`, {
                credentials: "include",
            })

            const oktaData = oktaResponse.ok ? await oktaResponse.json() : null

            setDebugInfo({
                saml: samlData,
                okta: oktaData,
                timestamp: new Date().toISOString(),
            })

            console.log("🔍 Debug - Sesión SAML:", samlData)
            console.log("🔍 Debug - Sesión Okta:", oktaData)
        } catch (error) {
            console.error("❌ Error verificando sesiones:", error)

            setDebugInfo({ error: error })
        }
    }

    // Si no está autenticado y no está cargando, redirigir
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log("❌ No autenticado, redirigiendo al login...")
            setTimeout(() => {
                router.push("/?error=not_authenticated")
            }, 2000)
        }
    }, [loading, isAuthenticated, router])

    const handleLogout = async () => {
        try {
            if (oktaAuth.isAuthenticated) {
                await oktaAuth.signOut()
            }
            if (samlAuth.isAuthenticated) {
                await samlAuth.logoutFromSAML()
            }
            router.push("/")
        } catch (error) {
            console.error("Error en logout:", error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p>Verificando autenticación...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>No tienes una sesión válida. Serás redirigido al login...</AlertDescription>
                        </Alert>

                        {/* Debug info */}
                        {debugInfo && (
                            <div className="text-xs bg-gray-100 p-2 rounded">
                                <strong>Debug Info:</strong>
                                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                            </div>
                        )}

                        <Button onClick={() => router.push("/")} className="w-full">
                            Ir al Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Dashboard - Acceso Autorizado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Información del usuario */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {oktaAuth.isAuthenticated && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Sesión Okta</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p>
                                                <strong>Email:</strong> {oktaAuth.user?.email}
                                            </p>
                                            <p>
                                                <strong>Nombre:</strong> {oktaAuth.user?.name}
                                            </p>
                                            <p>
                                                <strong>Estado:</strong> <span className="text-green-600">Autenticado</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {samlAuth.isAuthenticated && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Sesión SAML</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p>
                                                <strong>Usuario:</strong> {samlAuth.samlAttributes?.email || "N/A"}
                                            </p>
                                            <p>
                                                <strong>Método:</strong> {samlAuth.samlAttributes?.method || "SAML"}
                                            </p>
                                            <p>
                                                <strong>Estado:</strong> <span className="text-green-600">Autenticado</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Debug info */}
                        {debugInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información de Debug</CardTitle>
                                </CardHeader>
                                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                                    <Button onClick={checkBackendSession} variant="outline" size="sm" className="mt-2">
                                        Refrescar Debug
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-4">
                            <Button onClick={handleLogout} variant="outline">
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
