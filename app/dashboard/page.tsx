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

    // Efecto para logs y debug (solo cuando cambian los estados principales)
    useEffect(() => {
        console.log("🏠 Dashboard - Estados de autenticación:")
        console.log("📊 Okta:", { isAuthenticated: oktaAuth.isAuthenticated, loading: oktaAuth.loading })
        console.log("📊 SAML:", { isAuthenticated: samlAuth.isAuthenticated, loading: samlAuth.loading })

        // Actualizar debug info solo cuando sea necesario
        setDebugInfo({
            okta: {
                isAuthenticated: oktaAuth.isAuthenticated,
                user: oktaAuth.user?.email || null,
            },
            saml: {
                isAuthenticated: samlAuth.isAuthenticated,
                user: samlAuth.user || null,
            },
            localStorage: {
                saml_authenticated: typeof window !== "undefined" ? localStorage.getItem("saml_authenticated") : null,
                saml_user: typeof window !== "undefined" ? localStorage.getItem("saml_user") : null,
            },
            timestamp: new Date().toISOString(),
        })
    }, [oktaAuth.isAuthenticated, samlAuth.isAuthenticated, oktaAuth.loading, samlAuth.loading]) // Solo dependencias primitivas

    // Efecto para redirección (separado y con dependencias específicas)
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log("❌ No autenticado, redirigiendo al login...")
            const timer = setTimeout(() => {
                router.push("/?error=not_authenticated")
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [loading, isAuthenticated, router])

    const handleLogout = async () => {
        try {
            if (oktaAuth.isAuthenticated) {
                await oktaAuth.signOut()
            }
            if (samlAuth.isAuthenticated) {
                samlAuth.logoutFromSAML()
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
                                                <strong>Email:</strong> {oktaAuth.user?.email || "N/A"}
                                            </p>
                                            <p>
                                                <strong>Nombre:</strong> {oktaAuth.user?.name || "N/A"}
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
                                                <strong>Usuario:</strong> {samlAuth.user || "N/A"}
                                            </p>
                                            <p>
                                                <strong>Método:</strong> SAML
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
