"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOktaAuth } from "@/hooks/use-okta-auth"
import { useSAMLAuth } from "@/hooks/use-saml-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SAMLDemoPage() {
    const [activeTab, setActiveTab] = useState<string>("comparison")
    const { isAuthenticated: isOidcAuthenticated, user: oidcUser } = useOktaAuth()
    const { isAuthenticated: isSamlAuthenticated, samlAttributes, loginWithSAML, logoutFromSAML } = useSAMLAuth()
    const [samlStatus, setSamlStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [samlError, setSamlError] = useState<string | null>(null)

    const handleSAMLLogin = async () => {
        try {
            setSamlStatus("loading")
            setSamlError(null)
            await loginWithSAML()
        } catch (error) {
            console.error("Error en login SAML:", error)
            setSamlStatus("error")
            setSamlError(error instanceof Error ? error.message : "Error desconocido")
        }
    }

    const handleSAMLLogout = async () => {
        try {
            setSamlStatus("loading")
            setSamlError(null)
            await logoutFromSAML()
            setSamlStatus("idle")
        } catch (error) {
            console.error("Error en logout SAML:", error)
            setSamlStatus("error")
            setSamlError(error instanceof Error ? error.message : "Error desconocido")
        }
    }

    useEffect(() => {
        if (isSamlAuthenticated) {
            setSamlStatus("success")
        }
    }, [isSamlAuthenticated])

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Demo de Autenticación Dual: OIDC vs SAML</h1>
            <p className="text-center text-gray-600 mb-8">
                Esta página demuestra cómo tu aplicación React puede soportar ambos protocolos de autenticación
            </p>

            <Tabs
                defaultValue="comparison"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full max-w-4xl mx-auto"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comparison">Comparación</TabsTrigger>
                    <TabsTrigger value="oidc">OIDC</TabsTrigger>
                    <TabsTrigger value="saml">SAML 2.0</TabsTrigger>
                </TabsList>

                {/* Tab de Comparación */}
                <TabsContent value="comparison" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OIDC */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    OpenID Connect (OIDC)
                                </CardTitle>
                                <CardDescription>Protocolo moderno basado en OAuth 2.0</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Basado en JWT (JSON Web Tokens)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Ideal para SPAs y aplicaciones móviles</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Tokens ligeros y eficientes</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Mejor para APIs RESTful</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Más simple de implementar</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-medium">Estado actual:</p>
                                    <p>
                                        {isOidcAuthenticated ? (
                                            <span className="text-green-600">✅ Autenticado con OIDC</span>
                                        ) : (
                                            <span className="text-gray-500">❌ No autenticado</span>
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SAML */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    SAML 2.0
                                </CardTitle>
                                <CardDescription>Protocolo enterprise para SSO</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Basado en XML</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Compatible con sistemas legacy</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Ampliamente adoptado en enterprise</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Mejor para aplicaciones web tradicionales</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Más complejo pero más detallado</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-medium">Estado actual:</p>
                                    <p>
                                        {isSamlAuthenticated ? (
                                            <span className="text-green-600">✅ Autenticado con SAML</span>
                                        ) : (
                                            <span className="text-gray-500">❌ No autenticado</span>
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Implementación Dual en tu Aplicación React</CardTitle>
                            <CardDescription>Tu aplicación puede soportar ambos protocolos simultáneamente</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-medium mb-2">Arquitectura de Autenticación Dual</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-white rounded border">
                                        <h4 className="font-medium text-sm mb-2">Frontend (React)</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• Componentes para ambos protocolos</li>
                                            <li>• Hooks separados para OIDC y SAML</li>
                                            <li>• Rutas específicas para callbacks</li>
                                            <li>• UI adaptativa según protocolo</li>
                                        </ul>
                                    </div>
                                    <div className="p-3 bg-white rounded border">
                                        <h4 className="font-medium text-sm mb-2">Backend (Spring Boot)</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• Endpoints para validación OIDC</li>
                                            <li>• Endpoints para procesamiento SAML</li>
                                            <li>• Configuración dual en SecurityConfig</li>
                                            <li>• Conversión entre formatos cuando sea necesario</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button onClick={() => setActiveTab("oidc")} variant="outline" className="w-full">
                                    Ver detalles de OIDC
                                </Button>
                                <Button onClick={() => setActiveTab("saml")} variant="outline" className="w-full">
                                    Ver detalles de SAML
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab de OIDC */}
                <TabsContent value="oidc" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>OpenID Connect (OIDC)</CardTitle>
                            <CardDescription>Implementación y estado actual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isOidcAuthenticated ? (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertDescription className="text-green-700">
                                        Autenticado con OIDC como {oidcUser?.name || oidcUser?.email || "usuario"}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>No autenticado con OIDC</AlertDescription>
                                </Alert>
                            )}

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-medium mb-2">Implementación OIDC</h3>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Hook:</strong> useOktaAuth() - Maneja autenticación OIDC con Okta
                                    </p>
                                    <p>
                                        <strong>Flujo:</strong> Authorization Code con PKCE
                                    </p>
                                    <p>
                                        <strong>Token:</strong> JWT almacenado en memoria
                                    </p>
                                    <p>
                                        <strong>Callback:</strong> /callback
                                    </p>
                                </div>
                            </div>

                            {isOidcAuthenticated && oidcUser && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h3 className="font-medium mb-2">Información del Usuario (OIDC)</h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <strong>ID:</strong> {oidcUser.sub}
                                        </p>
                                        <p>
                                            <strong>Nombre:</strong> {oidcUser.name || "No disponible"}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {oidcUser.email || "No disponible"}
                                        </p>
                                        <p>
                                            <strong>Username:</strong> {oidcUser.preferred_username || "No disponible"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                                    Ir a Login OIDC
                                </Button>
                                <Button onClick={() => setActiveTab("saml")} variant="outline" className="w-full">
                                    Ver SAML
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Código OIDC</CardTitle>
                            <CardDescription>Implementación en React</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-sm font-mono">
                <pre>{`// Hook de autenticación OIDC
export function useOktaAuth() {
  // Estado y funciones para OIDC
  const [authState, setAuthState] = useState(null);
  const [user, setUser] = useState(null);
  
  // Iniciar sesión con OIDC
  const signIn = async () => {
    await oktaAuth.signInWithRedirect();
  };
  
  // Verificar token JWT
  useEffect(() => {
    oktaAuth.authStateManager.subscribe(updateAuthState);
    return () => {
      oktaAuth.authStateManager.unsubscribe(updateAuthState);
    };
  }, []);
  
  return {
    isAuthenticated,
    user,
    signIn,
    signOut
  };
}`}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab de SAML */}
                <TabsContent value="saml" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>SAML 2.0</CardTitle>
                            <CardDescription>Implementación y estado actual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {samlError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{samlError}</AlertDescription>
                                </Alert>
                            )}

                            {isSamlAuthenticated ? (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertDescription className="text-green-700">
                                        Autenticado con SAML como {samlAttributes?.name || samlAttributes?.email || "usuario"}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>No autenticado con SAML</AlertDescription>
                                </Alert>
                            )}

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-medium mb-2">Implementación SAML</h3>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <strong>Hook:</strong> useSAMLAuth() - Maneja autenticación SAML con Okta
                                    </p>
                                    <p>
                                        <strong>Flujo:</strong> SAML Web SSO Profile
                                    </p>
                                    <p>
                                        <strong>Respuesta:</strong> XML SAML Assertion
                                    </p>
                                    <p>
                                        <strong>Callback:</strong> /saml/callback
                                    </p>
                                </div>
                            </div>

                            {isSamlAuthenticated && samlAttributes && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h3 className="font-medium mb-2">Información del Usuario (SAML)</h3>
                                    <div className="space-y-1 text-sm">
                                        <p>
                                            <strong>NameID:</strong> {samlAttributes.nameID || "No disponible"}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {samlAttributes.email || "No disponible"}
                                        </p>
                                        <p>
                                            <strong>Nombre:</strong> {samlAttributes.firstName || "No disponible"}{" "}
                                            {samlAttributes.lastName || ""}
                                        </p>
                                        <p>
                                            <strong>Roles:</strong> {samlAttributes.roles || "No disponible"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!isSamlAuthenticated ? (
                                    <Button onClick={handleSAMLLogin} disabled={samlStatus === "loading"} className="w-full">
                                        {samlStatus === "loading" ? "Iniciando..." : "Iniciar sesión con SAML"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSAMLLogout}
                                        disabled={samlStatus === "loading"}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        {samlStatus === "loading" ? "Cerrando..." : "Cerrar sesión SAML"}
                                    </Button>
                                )}
                                <Button onClick={() => setActiveTab("oidc")} variant="outline" className="w-full">
                                    Ver OIDC
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Código SAML</CardTitle>
                            <CardDescription>Implementación en React</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-sm font-mono">
                <pre>{`// Hook de autenticación SAML
export function useSAMLAuth(options = {}) {
  // Estado y funciones para SAML
  const [state, setState] = useState({
    isAuthenticated: false,
    loading: true,
    error: null,
    samlResponse: null,
    samlAttributes: null,
  });
  
  // Iniciar login SAML (redirección completa)
  const loginWithSAML = () => {
    window.location.href = "/api/saml/login";
  };
  
  // Procesar respuesta SAML
  const processSAMLResponse = async (samlResponse) => {
    const response = await fetch("/api/saml/validate", {
      method: "POST",
      body: JSON.stringify({ SAMLResponse: samlResponse }),
    });
    
    // Procesar respuesta...
  };
  
  return {
    ...state,
    loginWithSAML,
    logoutFromSAML,
    processSAMLResponse
  };
}`}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
