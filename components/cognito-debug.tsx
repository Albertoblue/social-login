"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Copy, ExternalLink, AlertTriangle } from "lucide-react"
import { cognitoOidcConfig } from "@/lib/oidc-config"

export function CognitoDebug() {
    const [showDebug, setShowDebug] = useState(false)
    const [copied, setCopied] = useState(false)
    const [errorParams, setErrorParams] = useState<Record<string, string>>({})

    // Extraer parámetros de error de la URL si existen
    useState(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search)
            const params: Record<string, string> = {}

            // Buscar parámetros de error específicos
            const errorKeys = ["error", "error_description", "state"]
            errorKeys.forEach((key) => {
                const value = urlParams.get(key)
                if (value) params[key] = value
            })

            if (Object.keys(params).length > 0) {
                setErrorParams(params)
                setShowDebug(true)
            }
        }
    })

    const currentUrl = typeof window !== "undefined" ? window.location.origin : "unknown"

    const debugInfo = {
        "Current URL": currentUrl,
        "Configured Callback": cognitoOidcConfig.redirect_uri,
        "Configured Logout": cognitoOidcConfig.post_logout_redirect_uri,
        Authority: cognitoOidcConfig.authority,
        "Client ID": cognitoOidcConfig.client_id,
        Scope: cognitoOidcConfig.scope,
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const generateCognitoUrl = () => {
        const params = new URLSearchParams({
            client_id: cognitoOidcConfig.client_id!,
            response_type: "code",
            scope: cognitoOidcConfig.scope!,
            redirect_uri: cognitoOidcConfig.redirect_uri!,
        })

        return `${cognitoOidcConfig.authority}/oauth2/authorize?${params.toString()}`
    }

    if (!showDebug) {
        return (
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(true)}>
                <Info className="w-4 h-4 mr-2" />
                Debug Cognito
            </Button>
        )
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-sm">Debug de Configuración Cognito</CardTitle>
                <CardDescription>Información para diagnosticar problemas de redirección</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(errorParams).length > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-bold">Error detectado en la URL:</div>
                            <div className="space-y-1 mt-2">
                                {Object.entries(errorParams).map(([key, value]) => (
                                    <div key={key} className="text-xs">
                                        <span className="font-semibold">{key}:</span> {value}
                                    </div>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Verifica que estas URLs y scopes estén configurados exactamente igual en AWS Cognito
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    {Object.entries(debugInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{key}:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{value}</span>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value || "")}>
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium">URLs para configurar en AWS Cognito:</h4>

                    <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium mb-2">Callback URLs:</p>
                        <div className="space-y-1">
                            <code className="block text-xs bg-white p-1 rounded">
                                https://d84l1y8p4kdic.cloudfront.net/cognito/callback
                            </code>
                            <code className="block text-xs bg-white p-1 rounded">http://localhost:3000/cognito/callback</code>
                        </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium mb-2">Sign out URLs:</p>
                        <div className="space-y-1">
                            <code className="block text-xs bg-white p-1 rounded">https://d84l1y8p4kdic.cloudfront.net</code>
                            <code className="block text-xs bg-white p-1 rounded">http://localhost:3000</code>
                        </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded">
                        <p className="text-sm font-medium mb-2">Allowed OAuth Scopes:</p>
                        <div className="space-y-1">
                            <code className="block text-xs bg-white p-1 rounded">openid</code>
                            <code className="block text-xs bg-white p-1 rounded">email</code>
                            <code className="block text-xs bg-white p-1 rounded">profile</code>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(generateCognitoUrl(), "_blank")}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Probar URL de Cognito
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
                        Cerrar
                    </Button>
                </div>

                {copied && (
                    <Alert>
                        <AlertDescription>¡Copiado al portapapeles!</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
