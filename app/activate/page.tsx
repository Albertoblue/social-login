"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface ActivationResult {
    success: boolean
    message: string
}

export default function ActivatePage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(true)
    const [result, setResult] = useState<ActivationResult | null>(null)

    useEffect(() => {
        const activateAccount = async () => {
            if (!token) {
                setResult({
                    success: false,
                    message: "Token de activación no válido",
                })
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                })

                const data = await response.json()
                setResult(data)
            } catch (error) {
                console.error("Error activating account:", error)
                setResult({
                    success: false,
                    message: "Error de conexión. Inténtalo de nuevo.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        activateAccount()
    }, [token])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
            <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-2xl font-bold">Activando cuenta...</CardTitle>
        <CardDescription>Por favor espera mientras activamos tu cuenta.</CardDescription>
        </CardHeader>
        </Card>
        </div>
    )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
        <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            result?.success ? "bg-green-100" : "bg-red-100"
        }`}
>
    {result?.success ? (
        <CheckCircle className="h-6 w-6 text-green-600" />
    ) : (
        <AlertCircle className="h-6 w-6 text-red-600" />
    )}
    </div>
    <CardTitle className={`text-2xl font-bold ${result?.success ? "text-green-600" : "text-red-600"}`}>
    {result?.success ? "¡Cuenta Activada!" : "Error de Activación"}
    </CardTitle>
    <CardDescription>{result?.message}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
    {result?.success ? (
        <div className="space-y-4">
        <div className="text-center text-sm text-gray-600">
            Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión y comenzar a usar la plataforma.
    </div>
    <Button asChild className="w-full">
    <Link href="/login">Iniciar Sesión</Link>
    </Button>
    </div>
) : (
        <div className="space-y-4">
        <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result?.message || "No se pudo activar la cuenta"}</AlertDescription>
    </Alert>
    <div className="flex gap-2">
    <Button variant="outline" asChild className="flex-1">
    <Link href="/register">Registrarse</Link>
        </Button>
        <Button asChild className="flex-1">
    <Link href="/login">Iniciar Sesión</Link>
    </Button>
    </div>
    </div>
)}
    </CardContent>
    </Card>
    </div>
)
}
