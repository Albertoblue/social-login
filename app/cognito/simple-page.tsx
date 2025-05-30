"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SimpleCognitoCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [message, setMessage] = useState("Procesando autenticación...")
    const hasProcessed = useRef(false)

    useEffect(() => {
        if (hasProcessed.current) return

        const handleCallback = async () => {
            hasProcessed.current = true

            try {
                const code = searchParams.get("code")

                if (!code) {
                    throw new Error("No se recibió código de autorización")
                }

                setMessage("Intercambiando código por tokens...")

                // Intercambio directo sin validación de state
                const tokenUrl = "https://us-east-1sch6bvepp.auth.us-east-1.amazoncognito.com/oauth2/token"
                const redirectUri = window.location.origin + "/cognito/callback"

                const response = await fetch(tokenUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        client_id: "7g2qqurodeum6tc2h6e57vuec",
                        code: code,
                        redirect_uri: redirectUri,
                    }),
                })

                if (!response.ok) {
                    throw new Error("Error intercambiando código por tokens")
                }

                const tokens = await response.json()

                setMessage("Obteniendo información del usuario...")

                // Obtener información del usuario
                const userInfoResponse = await fetch(
                    "https://us-east-1sch6bvepp.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                    },
                )

                if (!userInfoResponse.ok) {
                    throw new Error("Error obteniendo información del usuario")
                }

                const userInfo = await userInfoResponse.json()

                // Guardar datos
                localStorage.setItem("cognito_tokens", JSON.stringify(tokens))
                localStorage.setItem("cognito_user", JSON.stringify(userInfo))
                localStorage.setItem("cognito_token_timestamp", Date.now().toString())

                setMessage("¡Autenticación exitosa! Redirigiendo...")

                // Redirigir al dashboard
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1000)
            } catch (error: any) {
                console.error("Error en callback:", error)
                setMessage("Error en la autenticación")
                setTimeout(() => {
                    router.push("/login?error=cognito_failed")
                }, 2000)
            }
        }

        handleCallback()
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando autenticación
                    </CardTitle>
                    <CardDescription>Completando tu inicio de sesión con AWS Cognito...</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">{message}</p>
                </CardContent>
            </Card>
        </div>
    )
}
