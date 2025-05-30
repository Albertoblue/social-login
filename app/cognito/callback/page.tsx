"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function CognitoCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [step, setStep] = useState(1)

    // Usar useRef para prevenir múltiples ejecuciones
    const hasProcessed = useRef(false)
    const isProcessing = useRef(false)
    const processedCode = useRef<string | null>(null)

    useEffect(() => {
        const code = searchParams.get("code")

        // Prevenir múltiples ejecuciones del mismo código
        if (hasProcessed.current || isProcessing.current) {
            console.log("⚠️ Callback ya procesado o en proceso, saltando...")
            return
        }

        // Verificar si ya procesamos este código específico
        if (code && processedCode.current === code) {
            console.log("⚠️ Este código ya fue procesado, saltando...")
            return
        }

        const handleCallback = async () => {
            // Marcar como en proceso
            isProcessing.current = true

            if (code) {
                processedCode.current = code
            }

            try {
                console.log("🔄 Iniciando manejo de callback de Cognito...")
                setStep(1)
                setMessage("Verificando parámetros de autenticación...")

                // Obtener parámetros de la URL
                const state = searchParams.get("state")
                const error = searchParams.get("error")
                const errorDescription = searchParams.get("error_description")

                console.log("📋 Parámetros recibidos:", {
                    code: code?.substring(0, 10) + "...",
                    state,
                    error,
                    errorDescription,
                })

                // Verificar si hay errores en la URL
                if (error) {
                    throw new Error(`Error de Cognito: ${error} - ${errorDescription}`)
                }

                // Verificar que tenemos el código de autorización
                if (!code) {
                    throw new Error("No se recibió código de autorización de Cognito")
                }

                // Verificar si ya tenemos tokens válidos en localStorage
                const existingTokens = localStorage.getItem("cognito_tokens")
                const existingUser = localStorage.getItem("cognito_user")
                const backendValidated = localStorage.getItem("cognito_backend_validated")

                if (existingTokens && existingUser && backendValidated) {
                    console.log("✅ Ya tenemos tokens válidos, redirigiendo...")
                    setStatus("success")
                    setMessage("Sesión ya establecida, redirigiendo...")
                    setTimeout(() => router.push("/dashboard"), 1000)
                    return
                }

                setStep(2)
                setMessage("Intercambiando código por tokens...")

                // Intercambiar código por tokens
                const tokens = await exchangeCodeForTokens(code)
                if (!tokens) {
                    throw new Error("No se pudieron obtener tokens de Cognito")
                }

                console.log("✅ Tokens obtenidos exitosamente")
                setStep(3)
                setMessage("Obteniendo información del usuario...")

                // Obtener información del usuario
                const userInfo = await fetchUserInfo(tokens.access_token)
                if (!userInfo) {
                    throw new Error("No se pudo obtener información del usuario")
                }

                console.log("✅ Información del usuario obtenida:", userInfo)
                setStep(4)
                setMessage("Validando con el backend...")

                // Validar con el backend
                const backendValidation = await validateWithBackend(tokens.access_token)
                if (!backendValidation) {
                    throw new Error("El backend no pudo validar el token de Cognito")
                }

                console.log("✅ Token validado con el backend:", backendValidation)
                setStep(5)
                setMessage("Guardando sesión...")

                // Guardar tokens y información del usuario
                localStorage.setItem("cognito_tokens", JSON.stringify(tokens))
                localStorage.setItem("cognito_user", JSON.stringify(userInfo))
                localStorage.setItem("cognito_token_timestamp", Date.now().toString())
                localStorage.setItem("cognito_backend_validated", "true")

                // Marcar como procesado exitosamente
                hasProcessed.current = true

                setStatus("success")
                setStep(6)
                setMessage("¡Autenticación exitosa! Redirigiendo al dashboard...")
                setDebugInfo({
                    userInfo,
                    backendValidation: true,
                    tokens: { ...tokens, access_token: tokens.access_token.substring(0, 20) + "..." },
                })

                console.log("🎉 Proceso completado exitosamente, redirigiendo...")

                // Limpiar la URL para evitar reutilización del código
                window.history.replaceState({}, document.title, "/cognito/callback")

                // Redirigir al dashboard después de 2 segundos
                setTimeout(() => {
                    console.log("🔄 Redirigiendo a /dashboard...")
                    router.push("/dashboard")
                }, 2000)
            } catch (error: any) {
                console.error("❌ Error en callback de Cognito:", error)

                // Marcar como procesado (aunque con error)
                hasProcessed.current = true

                setStatus("error")
                setMessage(error.message || "Error desconocido en la autenticación")
                setDebugInfo({
                    error: error.message,
                    step: step,
                    searchParams: Object.fromEntries(searchParams.entries()),
                    stack: error.stack,
                    processedCode: processedCode.current,
                })

                // Limpiar la URL en caso de error también
                window.history.replaceState({}, document.title, "/cognito/callback")
            } finally {
                // Marcar como no en proceso
                isProcessing.current = false
            }
        }

        // Solo ejecutar si tenemos un código y no hemos procesado
        if (code && !hasProcessed.current && !isProcessing.current) {
            handleCallback()
        }
    }, [searchParams, router, step])

    // Función para intercambiar código por tokens
    const exchangeCodeForTokens = async (code: string) => {
        try {
            const tokenUrl = "https://us-east-1sch6bvepp.auth.us-east-1.amazoncognito.com/oauth2/token"
            const redirectUri = window.location.origin + "/cognito/callback"

            console.log("🔄 Intercambiando código por tokens...")
            console.log("📍 Token URL:", tokenUrl)
            console.log("📍 Redirect URI:", redirectUri)
            console.log("📍 Code:", code.substring(0, 10) + "...")

            const body = new URLSearchParams({
                grant_type: "authorization_code",
                client_id: "7g2qqurodeum6tc2h6e57vuec",
                code: code,
                redirect_uri: redirectUri,
            })

            console.log("📤 Request body:", body.toString())

            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body,
            })

            console.log("📥 Response status:", response.status, response.statusText)

            if (!response.ok) {
                const errorData = await response.text()
                console.error("❌ Error en intercambio de tokens:", errorData)

                // Si es invalid_grant, dar más contexto
                if (errorData.includes("invalid_grant")) {
                    throw new Error(
                        `El código de autorización ya fue usado o expiró. Esto puede suceder si:\n- El código ya se usó anteriormente\n- El código expiró (tienen vida muy corta)\n- Hay múltiples pestañas abiertas\n\nPor favor, intenta iniciar sesión nuevamente.`,
                    )
                }

                throw new Error(`Token exchange failed: ${response.status} - ${errorData}`)
            }

            const tokens = await response.json()
            console.log("✅ Tokens recibidos:", Object.keys(tokens))
            return tokens
        } catch (error) {
            console.error("❌ Error intercambiando código por tokens:", error)
            throw error
        }
    }

    // Función para obtener información del usuario
    const fetchUserInfo = async (accessToken: string) => {
        try {
            const userInfoUrl = "https://us-east-1sch6bvepp.auth.us-east-1.amazoncognito.com/oauth2/userInfo"

            console.log("🔄 Obteniendo información del usuario...")

            const response = await fetch(userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.text()
                console.error("❌ Error obteniendo info del usuario:", errorData)
                throw new Error(`UserInfo failed: ${response.status} - ${errorData}`)
            }

            const userInfo = await response.json()
            console.log("✅ Información del usuario recibida:", userInfo)
            return userInfo
        } catch (error) {
            console.error("❌ Error obteniendo información del usuario:", error)
            throw error
        }
    }

    // Función para validar con el backend
    const validateWithBackend = async (accessToken: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            console.log("🔄 Validando token con el backend...")
            console.log("📍 API URL:", `${apiUrl}/api/auth/validate-cognito`)

            const response = await fetch(`${apiUrl}/api/auth/validate-cognito`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            })

            console.log("📊 Respuesta del backend:", response.status, response.statusText)

            if (!response.ok) {
                const errorData = await response.text()
                console.error("❌ Backend rechazó el token:", errorData)
                throw new Error(`Backend validation failed: ${response.status} - ${errorData}`)
            }

            const result = await response.json()
            console.log("✅ Token validado con backend:", result)
            return result
        } catch (error) {
            console.error("❌ Error validando con backend:", error)
            throw error
        }
    }

    const handleRetry = () => {
        // Limpiar todo y volver al login
        localStorage.removeItem("cognito_tokens")
        localStorage.removeItem("cognito_user")
        localStorage.removeItem("cognito_token_timestamp")
        localStorage.removeItem("cognito_backend_validated")

        router.push("/")
    }

    const handleGoToDashboard = () => {
        router.push("/dashboard")
    }

    const handleGoToLogin = () => {
        router.push("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
                        {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}

                        {status === "loading" && "Procesando autenticación"}
                        {status === "success" && "¡Autenticación exitosa!"}
                        {status === "error" && "Error de autenticación"}
                    </CardTitle>
                    <CardDescription>
                        {status === "loading" && "Completando tu inicio de sesión con AWS Cognito..."}
                        {status === "success" && "Te redirigiremos al dashboard en unos segundos."}
                        {status === "error" && "Hubo un problema con la autenticación."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Indicador de progreso */}
                    {status === "loading" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Paso {step} de 6</span>
                                <span>{Math.round((step / 6) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(step / 6) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <div className="text-center text-sm text-muted-foreground">
                        <p>{message}</p>
                    </div>

                    {status === "error" && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription className="whitespace-pre-line">{message}</AlertDescription>
                        </Alert>
                    )}

                    {status === "success" && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Autenticación completada exitosamente. Serás redirigido automáticamente.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Botones de acción */}
                    {status === "error" && (
                        <div className="flex gap-2">
                            <Button onClick={handleRetry} variant="outline" className="flex-1">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Intentar de Nuevo
                            </Button>
                            <Button onClick={handleGoToLogin} variant="outline" className="flex-1">
                                Volver al Login
                            </Button>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex gap-2">
                            <Button onClick={handleGoToDashboard} className="flex-1">
                                Ir al Dashboard
                            </Button>
                        </div>
                    )}

                    {debugInfo && (
                        <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Ver detalles técnicos</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
