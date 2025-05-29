"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOktaAuth } from "@/hooks/use-okta-auth"
import { SAMLLoginButton } from "@/components/saml-login-button"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function AuthProviderSelector() {
    const [activeTab, setActiveTab] = useState<string>("oidc")
    const { signIn: oktaSignIn, loading: oktaLoading, error: oktaError } = useOktaAuth()

    const handleOktaLogin = async () => {
        try {
            await oktaSignIn()
        } catch (error) {
            console.error("Error en login con Okta:", error)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Selecciona Método de Autenticación</CardTitle>
                <CardDescription className="text-center">
                    Elige entre OIDC (moderno) o SAML 2.0 (compatible con sistemas legacy)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="oidc" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="oidc">OIDC (Moderno)</TabsTrigger>
                        <TabsTrigger value="saml">SAML 2.0 (Legacy)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="oidc" className="space-y-4 mt-4">
                        {oktaError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{oktaError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                                OpenID Connect es el protocolo recomendado para aplicaciones modernas, móviles y SPAs.
                            </p>
                            <Button onClick={handleOktaLogin} disabled={oktaLoading} className="w-full" variant="default">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                                        fill="currentColor"
                                    />
                                </svg>
                                {oktaLoading ? "Conectando..." : "Iniciar sesión con Okta (OIDC)"}
                            </Button>
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                            <p>✅ Recomendado para: React, móvil, APIs</p>
                            <p>✅ Usa tokens JWT ligeros</p>
                            <p>✅ Mejor rendimiento</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="saml" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                                SAML 2.0 es compatible con sistemas empresariales legacy y aplicaciones tradicionales.
                            </p>
                            <SAMLLoginButton className="w-full" variant="outline" idpName="Okta (SAML 2.0)" />
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                            <p>✅ Compatible con: Oracle, SAP, SharePoint</p>
                            <p>✅ Usa XML assertions</p>
                            <p>✅ Mayor compatibilidad enterprise</p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Ambos protocolos son seguros y se conectan con Okta como proveedor de identidad.</p>
                </div>
            </CardContent>
        </Card>
    )
}
