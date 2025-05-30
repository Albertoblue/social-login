"use client"

import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CognitoCallbackPage() {
    const auth = useAuth()

    useEffect(() => {
        // Si el usuario está autenticado, redirigir al dashboard
        if (auth.isAuthenticated && auth.user) {
            console.log("✅ Autenticación exitosa, redirigiendo al dashboard...")
            window.location.href = "/dashboard"
        }
    }, [auth.isAuthenticated, auth.user])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando autenticación
                    </CardTitle>
                    <CardDescription>Estamos completando tu inicio de sesión con AWS Cognito...</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>Serás redirigido automáticamente en unos segundos.</p>
                </CardContent>
            </Card>
        </div>
    )
}
