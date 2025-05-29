"use client"

import { CardDescription } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, LogOut } from "lucide-react"
import { useOktaAuth } from "@/hooks/use-okta-auth"
import { useSAMLAuth } from "@/hooks/use-saml-auth"
import { useApi } from "@/hooks/use-api"

export default function DashboardPage() {
    const router = useRouter()
    const [debugInfo, setDebugInfo] = useState<any>(null)

    // Hooks de autenticación
    const oktaAuth = useOktaAuth()
    const samlAuth = useSAMLAuth()
    const { get, post } = useApi()

    // Estados para el dashboard OIDC
    const [profile, setProfile] = useState<any>(null)
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [testResults, setTestResults] = useState<any>(null)

    // Estado combinado
    const isAuthenticated = oktaAuth.isAuthenticated || samlAuth.isAuthenticated
    const loading = oktaAuth.loading || samlAuth.loading
    const authMethod = oktaAuth.isAuthenticated ? "OIDC" : samlAuth.isAuthenticated ? "SAML" : null

    // Efecto para logs y debug
    useEffect(() => {
        console.log("🏠 Dashboard - Estados de autenticación:")
        console.log("📊 Okta:", { isAuthenticated: oktaAuth.isAuthenticated, loading: oktaAuth.loading })
        console.log("📊 SAML:", { isAuthenticated: samlAuth.isAuthenticated, loading: samlAuth.loading })
        console.log("🔑 Método:", authMethod)

        setDebugInfo({
            authMethod,
            okta: {
                isAuthenticated: oktaAuth.isAuthenticated,
                user: oktaAuth.user?.email || null,
            },
            saml: {
                isAuthenticated: samlAuth.isAuthenticated,
                user: samlAuth.user || null,
            },
            timestamp: new Date().toISOString(),
        })
    }, [oktaAuth.isAuthenticated, samlAuth.isAuthenticated, oktaAuth.loading, samlAuth.loading, authMethod])

    // Efecto para redirección
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            console.log("❌ No autenticado, redirigiendo al login...")
            const timer = setTimeout(() => {
                router.push("/?error=not_authenticated")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [loading, isAuthenticated, router])

    // Funciones para el dashboard OIDC (solo si está autenticado con OIDC)
    const testTokenValidation = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const result = await get("/auth/validate")
            setTestResults({ type: "validation", data: result })
            console.log("✅ Token validation successful:", result)
        } catch (error: any) {
            setApiError(`Token validation failed: ${error.message}`)
            console.error("❌ Token validation failed:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const testTokenDebug = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const result = await get("/debug/token")
            setTestResults({ type: "debug", data: result })
            console.log("🔍 Token debug info:", result)
        } catch (error: any) {
            setApiError(`Token debug failed: ${error.message}`)
            console.error("❌ Token debug failed:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const testPublicEndpoint = async () => {
        try {
            setApiLoading(true)
            setApiError(null)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/public/health`)
            const result = await response.json()
            setTestResults({ type: "public", data: result })
            console.log("🌐 Public endpoint result:", result)
        } catch (error: any) {
            setApiError(`Public endpoint failed: ${error.message}`)
            console.error("❌ Public endpoint failed:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const testAuthenticatedPost = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const testData = {
                message: "Hello from frontend!",
                timestamp: new Date().toISOString(),
                user: oktaAuth.user?.email,
            }
            const result = await post("/test/authenticated-post", testData)
            setTestResults({ type: "post", data: result })
            console.log("📤 POST test successful:", result)
        } catch (error: any) {
            setApiError(`POST test failed: ${error.message}`)
            console.error("❌ POST test failed:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const testValidationProcess = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const result = await get("/debug/validation-process")
            setTestResults({ type: "validation_process", data: result })
            console.log("🔍 Validation process debug:", result)
        } catch (error: any) {
            setApiError(`Validation process debug failed: ${error.message}`)
            console.error("❌ Validation process debug failed:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const fetchUserProfile = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const data = await get("/user/profile")
            setProfile(data.user)
            setTestResults({ type: "profile", data })
            console.log("👤 User profile:", data)
        } catch (error: any) {
            setApiError(error.message)
            console.error("Error fetching profile:", error)
        } finally {
            setApiLoading(false)
        }
    }

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
                        <Button onClick={() => router.push("/")} className="w-full">
                            Ir al Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Dashboard para SAML (simple)
    if (authMethod === "SAML") {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                Dashboard SAML - Acceso Autorizado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Sesión SAML 2.0</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Usuario:</strong> {samlAuth.user || "N/A"}
                                        </p>
                                        <p>
                                            <strong>Método:</strong> SAML 2.0
                                        </p>
                                        <p>
                                            <strong>Estado:</strong> <span className="text-green-600">Autenticado</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Debug info para SAML */}
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

    // Dashboard para OIDC (completo con pruebas de API)
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Información del usuario OIDC */}
                <Card>
                    <CardHeader>
                        <CardTitle>¡Bienvenido al Dashboard OIDC!</CardTitle>
                        <CardDescription>Has iniciado sesión exitosamente con Okta usando OpenID Connect</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {oktaAuth.user && (
                            <div className="space-y-2">
                                <p>
                                    <strong>Nombre:</strong> {oktaAuth.user.name || "No disponible"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {oktaAuth.user.email || "No disponible"}
                                </p>
                                <p>
                                    <strong>Usuario:</strong> {oktaAuth.user.preferred_username || oktaAuth.user.sub}
                                </p>
                            </div>
                        )}

                        {/* Mostrar Access Token (solo primeros caracteres) */}
                        {oktaAuth.accessToken && (
                            <div className="mt-4 p-4 bg-gray-100 rounded">
                                <p className="text-sm font-medium">Access Token (primeros 50 caracteres):</p>
                                <p className="text-xs font-mono break-all">{oktaAuth.accessToken.substring(0, 50)}...</p>
                            </div>
                        )}

                        <Button onClick={handleLogout} variant="outline" className="w-full">
                            Cerrar Sesión
                        </Button>
                    </CardContent>
                </Card>

                {/* Pruebas de API para OIDC */}
                <Card>
                    <CardHeader>
                        <CardTitle>🧪 Pruebas de Validación de Token</CardTitle>
                        <CardDescription>Prueba la comunicación entre frontend y backend</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {apiError && (
                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                <strong>Error:</strong> {apiError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button onClick={testPublicEndpoint} disabled={apiLoading} variant="outline" className="w-full">
                                🌐 {apiLoading ? "Probando..." : "Endpoint Público"}
                            </Button>

                            <Button
                                onClick={testTokenValidation}
                                disabled={apiLoading || !oktaAuth.accessToken}
                                variant="outline"
                                className="w-full"
                            >
                                ✅ {apiLoading ? "Validando..." : "Validar Token"}
                            </Button>

                            <Button
                                onClick={fetchUserProfile}
                                disabled={apiLoading || !oktaAuth.accessToken}
                                variant="outline"
                                className="w-full"
                            >
                                👤 {apiLoading ? "Obteniendo..." : "Perfil Usuario"}
                            </Button>

                            <Button
                                onClick={testTokenDebug}
                                disabled={apiLoading || !oktaAuth.accessToken}
                                variant="outline"
                                className="w-full"
                            >
                                🔍 {apiLoading ? "Analizando..." : "Debug Token"}
                            </Button>

                            <Button
                                onClick={testValidationProcess}
                                disabled={apiLoading || !oktaAuth.accessToken}
                                variant="outline"
                                className="w-full"
                            >
                                🔄 {apiLoading ? "Analizando..." : "Proceso Validación"}
                            </Button>

                            <Button
                                onClick={testAuthenticatedPost}
                                disabled={apiLoading || !oktaAuth.accessToken}
                                variant="outline"
                                className="w-full md:col-span-2"
                            >
                                📤 {apiLoading ? "Enviando..." : "Test POST Autenticado"}
                            </Button>
                        </div>

                        {/* Mostrar resultados de las pruebas */}
                        {testResults && (
                            <div className="mt-6 space-y-4">
                                {/* Resultado específico para validation_process */}
                                {testResults.type === "validation_process" && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                                        <h3 className="font-medium text-green-800 mb-4">🔍 Proceso de Validación JWT</h3>
                                        <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                                    </div>
                                )}

                                {/* Resultados para otros tipos de pruebas */}
                                {testResults.type !== "validation_process" && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                                        <h3 className="font-medium text-green-800 mb-2">
                                            ✅ Resultado de{" "}
                                            {testResults.type === "debug"
                                                ? "Debug Token"
                                                : testResults.type === "validation"
                                                    ? "Validación"
                                                    : testResults.type === "public"
                                                        ? "Endpoint Público"
                                                        : testResults.type === "post"
                                                            ? "POST Autenticado"
                                                            : testResults.type === "profile"
                                                                ? "Perfil Usuario"
                                                                : testResults.type}
                                            :
                                        </h3>
                                        <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mostrar perfil si se obtuvo */}
                        {profile && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                <h3 className="font-medium text-blue-800 mb-2">👤 Perfil del Usuario:</h3>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <strong>ID:</strong> {profile.sub || profile.id}
                                    </p>
                                    <p>
                                        <strong>Nombre:</strong> {profile.name || "No disponible"}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {profile.email || "No disponible"}
                                    </p>
                                    <p>
                                        <strong>Username:</strong> {profile.preferred_username || "No disponible"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información técnica */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔧 Información Técnica</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}
                            </p>
                            <p>
                                <strong>Token disponible:</strong> {oktaAuth.accessToken ? "✅ Sí" : "❌ No"}
                            </p>
                            <p>
                                <strong>Estado autenticación:</strong>{" "}
                                {oktaAuth.isAuthenticated ? "✅ Autenticado" : "❌ No autenticado"}
                            </p>
                            <p>
                                <strong>Método:</strong> OpenID Connect (OIDC)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
