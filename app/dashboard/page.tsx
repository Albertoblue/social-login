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
import { useCognitoAuth } from "@/hooks/use-cognito-auth"
import { useApi } from "@/hooks/use-api"
import { getTokenFromDashboardURL, clearTokenFromURL, decodeJWT, type JWTPayload } from "@/lib/utils"
import { TokenValidationButton } from "@/components/token-validation-button"
import { UserValidationButton } from "@/components/user-validation-button"

export default function DashboardPage() {
    const router = useRouter()
    const [debugInfo, setDebugInfo] = useState<any>(null)

    // Hooks de autenticación
    const oktaAuth = useOktaAuth()
    const samlAuth = useSAMLAuth()
    const cognitoAuth = useCognitoAuth()
    const { get, post, apiCall, accessToken } = useApi()

    // Estados para el dashboard OIDC
    const [profile, setProfile] = useState<any>(null)
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [testResults, setTestResults] = useState<any>(null)

    // Estados para JWT desde URL
    const [urlJwtPayload, setUrlJwtPayload] = useState<JWTPayload | null>(null)
    const [urlJwtSource, setUrlJwtSource] = useState<string | null>(null)
    const [urlRawToken, setUrlRawToken] = useState<string | null>(null)

    // Estados para session tokens
    const [samlSessionToken, setSamlSessionToken] = useState<string | null>(null)
    const [urlSessionToken, setUrlSessionToken] = useState<string | null>(null)
    const [oktaSessionToken, setOktaSessionToken] = useState<string | null>(null)
    const [cognitoSessionToken, setCognitoSessionToken] = useState<string | null>(null)

    // Debug para session tokens
    useEffect(() => {
        console.log("🔄 Session tokens updated:", {
            samlSessionToken: samlSessionToken ? samlSessionToken.substring(0, 30) + "..." : null,
            urlSessionToken: urlSessionToken ? urlSessionToken.substring(0, 30) + "..." : null,
            oktaSessionToken: oktaSessionToken ? oktaSessionToken.substring(0, 30) + "..." : null,
            cognitoSessionToken: cognitoSessionToken ? cognitoSessionToken.substring(0, 30) + "..." : null
        })
    }, [samlSessionToken, urlSessionToken, oktaSessionToken, cognitoSessionToken])

    // Debug callbacks para verificar que se están pasando correctamente
    const handleSamlTokenReceived = (token: string) => {
        console.log("📞 SAML callback recibido:", token.substring(0, 30) + "...")
        setSamlSessionToken(token)
    }

    const handleUrlTokenReceived = (token: string) => {
        console.log("📞 URL callback recibido:", token.substring(0, 30) + "...")
        setUrlSessionToken(token)
    }

    const handleOktaTokenReceived = (token: string) => {
        console.log("📞 Okta callback recibido:", token.substring(0, 30) + "...")
        setOktaSessionToken(token)
    }

    const handleCognitoTokenReceived = (token: string) => {
        console.log("📞 Cognito callback recibido:", token.substring(0, 30) + "...")
        setCognitoSessionToken(token)
    }

    // Estado combinado
    const isAuthenticated = oktaAuth.isAuthenticated || samlAuth.isAuthenticated || cognitoAuth.isAuthenticated || !!urlJwtPayload
    const loading = oktaAuth.loading || samlAuth.loading || cognitoAuth.loading
    const authMethod = oktaAuth.isAuthenticated
        ? "OIDC"
        : samlAuth.isAuthenticated
            ? "SAML"
            : cognitoAuth.isAuthenticated
                ? "COGNITO"
                : urlJwtPayload
                    ? "JWT_URL"
                    : null

    // Efecto para manejar JWT desde URL
    useEffect(() => {
        const token = getTokenFromDashboardURL()
        if (token) {
            console.log("🔍 Token encontrado en URL:", token.substring(0, 50) + "...")
            
            const jwtPayload = decodeJWT(token)
            if (jwtPayload) {
                console.log("✅ JWT decodificado desde URL:", jwtPayload)
                setUrlJwtPayload(jwtPayload)
                setUrlRawToken(token) // Guardar el token raw para validación
                
                // Determinar el proveedor basado en el payload
                let source = "Unknown"
                if (jwtPayload.iss?.includes("cognito")) {
                    source = "AWS Cognito"
                } else if (jwtPayload.iss?.includes("okta")) {
                    source = "Okta"
                } else if (jwtPayload.aud || jwtPayload.sub) {
                    source = "Generic OAuth/SAML"
                }
                setUrlJwtSource(source)
                
                // Limpiar el token de la URL
                clearTokenFromURL()
            } else {
                console.error("❌ Error decodificando JWT desde URL")
            }
        }
    }, [])

    // Efecto para logs y debug
    useEffect(() => {
        console.log("🏠 Dashboard - Estados de autenticación:")
        console.log("📊 Okta:", { isAuthenticated: oktaAuth.isAuthenticated, loading: oktaAuth.loading })
        console.log("📊 SAML:", { isAuthenticated: samlAuth.isAuthenticated, loading: samlAuth.loading })
        console.log("📊 Cognito:", {
            isAuthenticated: cognitoAuth.isAuthenticated,
            loading: cognitoAuth.loading,
            backendValidated: cognitoAuth.backendValidated,
        })
        console.log("🔑 Método:", authMethod)
        console.log("🎫 JWT desde URL:", urlJwtPayload ? "Presente" : "No presente")

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
            cognito: {
                isAuthenticated: cognitoAuth.isAuthenticated,
                user: cognitoAuth.user?.email || null,
                backendValidated: cognitoAuth.backendValidated,
                hasAccessToken: !!cognitoAuth.accessToken,
            },
            urlJwt: {
                hasToken: !!urlJwtPayload,
                source: urlJwtSource,
                user: urlJwtPayload?.email || urlJwtPayload?.sub || null,
            },
            timestamp: new Date().toISOString(),
        })
    }, [
        oktaAuth.isAuthenticated,
        samlAuth.isAuthenticated,
        cognitoAuth.isAuthenticated,
        oktaAuth.loading,
        samlAuth.loading,
        cognitoAuth.loading,
        authMethod,
        urlJwtPayload,
        urlJwtSource,
        urlRawToken,
        samlSessionToken,
        urlSessionToken,
        oktaSessionToken,
        cognitoSessionToken,
    ])

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

    const fetchUserToken = async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const data = await get("/user/token")
            //setProfile(data.user)
            setTestResults({ type: "profile", data })
            console.log("👤 Token User:", data)
        } catch (error: any) {
            setApiError(error.message)
            console.error("Error fetching token:", error)
        } finally {
            setApiLoading(false)
        }
    }

    const fetchUserPermission =  async () => {
        if (!oktaAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const data = await apiCall("/user/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken && { "Session-Token": accessToken+"Hola" })
                },
                body: JSON.stringify({
                    resource: "/cc/model-configurator/products-operations/v1/products/searches",
                    action: "POST",
                    role: "LD_BUSINESS_ADMIN"
                })
            })
            //setProfile(data.user)
            setTestResults({ type: "profile", data })
            console.log("👤 Token User:", data)
        } catch (error: any) {
            setApiError(error.message)
            console.error("Error fetching token:", error)
        } finally {
            setApiLoading(false)
        }
    }


    // Funciones para Cognito
    const testCognitoValidation = async () => {
        if (!cognitoAuth.isAuthenticated) return
        try {
            setApiLoading(true)
            setApiError(null)
            const result = await cognitoAuth.authenticatedFetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/validate-cognito`,
            )
            const data = await result.json()
            setTestResults({ type: "cognito_validation", data })
            console.log("✅ Cognito validation successful:", data)
        } catch (error: any) {
            setApiError(`Cognito validation failed: ${error.message}`)
            console.error("❌ Cognito validation failed:", error)
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
            if (cognitoAuth.isAuthenticated) {
                cognitoAuth.signOut()
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
                        <div className="mt-4 text-xs text-muted-foreground">
                            <p>Okta: {oktaAuth.loading ? "Cargando..." : oktaAuth.isAuthenticated ? "✅" : "❌"}</p>
                            <p>SAML: {samlAuth.loading ? "Cargando..." : samlAuth.isAuthenticated ? "✅" : "❌"}</p>
                            <p>Cognito: {cognitoAuth.loading ? "Cargando..." : cognitoAuth.isAuthenticated ? "✅" : "❌"}</p>
                            <p>URL JWT: {urlJwtPayload ? "✅" : "❌"}</p>
                        </div>
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

                        {/* Debug info para ver qué está pasando */}
                        <div className="text-xs bg-gray-100 p-3 rounded">
                            <p>
                                <strong>Debug Info:</strong>
                            </p>
                            <p>Okta: {oktaAuth.isAuthenticated ? "✅ Autenticado" : "❌ No autenticado"}</p>
                            <p>SAML: {samlAuth.isAuthenticated ? "✅ Autenticado" : "❌ No autenticado"}</p>
                            <p>Cognito: {cognitoAuth.isAuthenticated ? "✅ Autenticado" : "❌ No autenticado"}</p>
                            <p>Cognito Backend: {cognitoAuth.backendValidated ? "✅ Validado" : "❌ No validado"}</p>
                            <p>Cognito Token: {cognitoAuth.accessToken ? "✅ Presente" : "❌ Ausente"}</p>
                            <p>URL JWT: {urlJwtPayload ? "✅ Presente" : "❌ Ausente"}</p>
                        </div>

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

                            {/* Datos del JWT si están disponibles */}
                            {samlAuth.jwtPayload && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Datos del JWT SAML</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {samlAuth.jwtPayload.sub && (
                                                <p>
                                                    <strong>Subject (sub):</strong> {samlAuth.jwtPayload.sub}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.email && (
                                                <p>
                                                    <strong>Email:</strong> {samlAuth.jwtPayload.email}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.name && (
                                                <p>
                                                    <strong>Nombre:</strong> {samlAuth.jwtPayload.name}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.given_name && (
                                                <p>
                                                    <strong>Nombre:</strong> {samlAuth.jwtPayload.given_name}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.family_name && (
                                                <p>
                                                    <strong>Apellido:</strong> {samlAuth.jwtPayload.family_name}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.preferred_username && (
                                                <p>
                                                    <strong>Username:</strong> {samlAuth.jwtPayload.preferred_username}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.iss && (
                                                <p>
                                                    <strong>Emisor (iss):</strong> {samlAuth.jwtPayload.iss}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.aud && (
                                                <p>
                                                    <strong>Audiencia (aud):</strong> {Array.isArray(samlAuth.jwtPayload.aud) 
                                                        ? samlAuth.jwtPayload.aud.join(", ") 
                                                        : samlAuth.jwtPayload.aud}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.exp && (
                                                <p>
                                                    <strong>Expira:</strong> {new Date(samlAuth.jwtPayload.exp * 1000).toLocaleString()}
                                                </p>
                                            )}
                                            {samlAuth.jwtPayload.iat && (
                                                <p>
                                                    <strong>Emitido:</strong> {new Date(samlAuth.jwtPayload.iat * 1000).toLocaleString()}
                                                </p>
                                            )}
                                            
                                            {/* Mostrar otros campos personalizados */}
                                            {Object.entries(samlAuth.jwtPayload)
                                                .filter(([key]) => !['sub', 'email', 'name', 'given_name', 'family_name', 'preferred_username', 'iss', 'aud', 'exp', 'iat', 'nbf'].includes(key))
                                                .map(([key, value]) => (
                                                    <p key={key}>
                                                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </p>
                                                ))
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* JWT Payload completo (para debug) */}
                            {samlAuth.jwtPayload && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">JWT Payload Completo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96 border">
                                            {JSON.stringify(samlAuth.jwtPayload, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}

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

                            <div className="flex flex-col gap-4">
                                {samlAuth.rawToken && (
                                    <>
                                        <TokenValidationButton 
                                            token={samlAuth.rawToken}
                                            className="w-full"
                                            onAccessTokenReceived={handleSamlTokenReceived}
                                        >
                                            🔑 Validar Token SAML
                                        </TokenValidationButton>
                                        <UserValidationButton 
                                            token={samlAuth.rawToken}
                                            sessionToken={samlSessionToken || undefined}
                                            hasValidatedToken={!!samlSessionToken}
                                            className="w-full"
                                        >
                                            🛡️ Validar Usuario SAML
                                        </UserValidationButton>
                                    </>
                                )}
                                <Button onClick={handleLogout} variant="outline" className="w-full">
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

    // Dashboard para Cognito
    if (authMethod === "COGNITO") {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                Dashboard AWS Cognito - Acceso Autorizado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Sesión AWS Cognito</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Usuario:</strong> {cognitoAuth.user?.email || cognitoAuth.user?.sub || "N/A"}
                                        </p>
                                        <p>
                                            <strong>Nombre:</strong> {cognitoAuth.user?.name || "N/A"}
                                        </p>
                                        <p>
                                            <strong>Email Verificado:</strong> {cognitoAuth.user?.email_verified ? "✅ Sí" : "❌ No"}
                                        </p>
                                        <p>
                                            <strong>Método:</strong> AWS Cognito OIDC
                                        </p>
                                        <p>
                                            <strong>Estado:</strong> <span className="text-green-600">Autenticado</span>
                                        </p>
                                        <p>
                                            <strong>Backend Validado:</strong> {cognitoAuth.backendValidated ? "✅ Sí" : "❌ No"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pruebas de API para Cognito */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>🧪 Pruebas de API con Cognito</CardTitle>
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
                                            onClick={testCognitoValidation}
                                            disabled={apiLoading || !cognitoAuth.accessToken}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            ✅ {apiLoading ? "Validando..." : "Validar Token Cognito"}
                                        </Button>
                                    </div>

                                    {/* Mostrar resultados de las pruebas */}
                                    {testResults && (
                                        <div className="mt-6 space-y-4">
                                            <div className="p-4 bg-green-50 border border-green-200 rounded">
                                                <h3 className="font-medium text-green-800 mb-2">✅ Resultado de {testResults.type}:</h3>
                                                <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                          {JSON.stringify(testResults.data, null, 2)}
                        </pre>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Debug info para Cognito */}
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

                            <div className="flex flex-col gap-4">
                                {cognitoAuth.accessToken && (
                                    <>
                                        <TokenValidationButton 
                                            token={cognitoAuth.accessToken}
                                            className="w-full"
                                            onAccessTokenReceived={handleCognitoTokenReceived}
                                        >
                                            🔑 Validar Token Cognito
                                        </TokenValidationButton>
                                        <UserValidationButton 
                                            token={cognitoAuth.accessToken}
                                            sessionToken={cognitoSessionToken || undefined}
                                            hasValidatedToken={!!cognitoSessionToken}
                                            className="w-full"
                                        >
                                            🛡️ Validar Usuario Cognito
                                        </UserValidationButton>
                                    </>
                                )}
                                <Button onClick={handleLogout} variant="outline" className="w-full">
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

    // Dashboard para JWT desde URL
    if (authMethod === "JWT_URL") {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                Dashboard JWT - Token desde URL
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información del Token JWT</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Proveedor:</strong> {urlJwtSource || "Desconocido"}
                                        </p>
                                        <p>
                                            <strong>Método:</strong> JWT desde URL
                                        </p>
                                        <p>
                                            <strong>Estado:</strong> <span className="text-green-600">Token Procesado</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Datos del JWT */}
                            {urlJwtPayload && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Datos del Usuario (JWT)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {urlJwtPayload.sub && (
                                                <p>
                                                    <strong>Subject (sub):</strong> {urlJwtPayload.sub}
                                                </p>
                                            )}
                                            {urlJwtPayload.email && (
                                                <p>
                                                    <strong>Email:</strong> {urlJwtPayload.email}
                                                </p>
                                            )}
                                            {urlJwtPayload.name && (
                                                <p>
                                                    <strong>Nombre:</strong> {urlJwtPayload.name}
                                                </p>
                                            )}
                                            {urlJwtPayload.given_name && (
                                                <p>
                                                    <strong>Nombre:</strong> {urlJwtPayload.given_name}
                                                </p>
                                            )}
                                            {urlJwtPayload.family_name && (
                                                <p>
                                                    <strong>Apellido:</strong> {urlJwtPayload.family_name}
                                                </p>
                                            )}
                                            {urlJwtPayload.preferred_username && (
                                                <p>
                                                    <strong>Username:</strong> {urlJwtPayload.preferred_username}
                                                </p>
                                            )}
                                            {urlJwtPayload.username && (
                                                <p>
                                                    <strong>Username:</strong> {urlJwtPayload.username}
                                                </p>
                                            )}
                                            {urlJwtPayload.iss && (
                                                <p>
                                                    <strong>Emisor (iss):</strong> {urlJwtPayload.iss}
                                                </p>
                                            )}
                                            {urlJwtPayload.aud && (
                                                <p>
                                                    <strong>Audiencia (aud):</strong> {Array.isArray(urlJwtPayload.aud) 
                                                        ? urlJwtPayload.aud.join(", ") 
                                                        : urlJwtPayload.aud}
                                                </p>
                                            )}
                                            {urlJwtPayload.scope && (
                                                <p>
                                                    <strong>Scopes:</strong> {urlJwtPayload.scope}
                                                </p>
                                            )}
                                            {urlJwtPayload.exp && (
                                                <p>
                                                    <strong>Expira:</strong> {new Date(urlJwtPayload.exp * 1000).toLocaleString()}
                                                </p>
                                            )}
                                            {urlJwtPayload.iat && (
                                                <p>
                                                    <strong>Emitido:</strong> {new Date(urlJwtPayload.iat * 1000).toLocaleString()}
                                                </p>
                                            )}
                                            {urlJwtPayload.auth_time && (
                                                <p>
                                                    <strong>Tiempo de Auth:</strong> {new Date(urlJwtPayload.auth_time * 1000).toLocaleString()}
                                                </p>
                                            )}
                                            
                                            {/* Mostrar otros campos personalizados */}
                                            {Object.entries(urlJwtPayload)
                                                .filter(([key]) => ![
                                                    'sub', 'email', 'name', 'given_name', 'family_name', 'preferred_username', 
                                                    'username', 'iss', 'aud', 'exp', 'iat', 'nbf', 'scope', 'auth_time'
                                                ].includes(key))
                                                .map(([key, value]) => (
                                                    <p key={key}>
                                                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </p>
                                                ))
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* JWT Payload completo */}
                            {urlJwtPayload && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">JWT Payload Completo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96 border">
                                            {JSON.stringify(urlJwtPayload, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex flex-col gap-4">
                                {urlRawToken && (
                                    <>
                                        <TokenValidationButton 
                                            token={urlRawToken}
                                            className="w-full"
                                            onAccessTokenReceived={handleUrlTokenReceived}
                                        >
                                            🔑 Validar Token
                                        </TokenValidationButton>
                                        <UserValidationButton 
                                            token={urlRawToken}
                                            sessionToken={urlSessionToken || undefined}
                                            hasValidatedToken={!!urlSessionToken}
                                            className="w-full"
                                        >
                                            🛡️ Validar Usuario
                                        </UserValidationButton>
                                    </>
                                )}
                                <Button onClick={() => {
                                    setUrlJwtPayload(null)
                                    setUrlJwtSource(null)
                                    setUrlRawToken(null)
                                    setUrlSessionToken(null)
                                    router.push("/")
                                }} variant="outline" className="w-full">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Volver al Login
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

                        <div className="flex flex-col gap-4">
                            {oktaAuth.accessToken && (
                                <>
                                    <TokenValidationButton 
                                        token={oktaAuth.accessToken}
                                        className="w-full"
                                        onAccessTokenReceived={handleOktaTokenReceived}
                                    >
                                        🔑 Validar Token Okta
                                    </TokenValidationButton>
                                    <UserValidationButton 
                                        token={oktaAuth.accessToken}
                                        sessionToken={oktaSessionToken || undefined}
                                        hasValidatedToken={!!oktaSessionToken}
                                        className="w-full"
                                    >
                                        🛡️ Validar Usuario Okta
                                    </UserValidationButton>
                                </>
                            )}
                            <Button onClick={handleLogout} variant="outline" className="w-full">
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar Sesión
                            </Button>
                        </div>
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

                        <Button
                            onClick={fetchUserToken}
                            disabled={apiLoading || !oktaAuth.accessToken}
                            variant="outline"
                            className="w-full"
                        >
                            🔑 {apiLoading ? "Analizando..." : "Authorizacion okta"}
                        </Button>

                        <Button
                            onClick={fetchUserPermission}
                            disabled={apiLoading || !oktaAuth.accessToken}
                            variant="outline"
                            className="w-full"
                        >
                            🔑 {apiLoading ? "Analizando..." : "Verificar permisos"}
                        </Button>


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
