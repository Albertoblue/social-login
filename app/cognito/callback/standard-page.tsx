"use client"

import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function CognitoStandardCallbackPage() {
    const auth = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (auth.isAuthenticated) {
            console.log("✅ Usuario autenticado, redirigiendo al dashboard...")
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        }
    }, [auth.isAuthenticated, router])

    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Procesando autenticación
                        </CardTitle>
                        <CardDescription>Completando tu inicio de sesión con AWS Cognito...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (auth.error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            Error de autenticación
                        </CardTitle>
                        <CardDescription>{auth.error.message}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (auth.isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            ¡Autenticación exitosa!
                        </CardTitle>
                        <CardDescription>Redirigiendo al dashboard...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return null
}
