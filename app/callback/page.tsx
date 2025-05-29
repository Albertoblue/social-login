"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import oktaAuth from "@/lib/okta-config"

export default function CallbackPage() {
    const router = useRouter()
    const [status, setStatus] = useState("Procesando autenticación...")
    const [error, setError] = useState<string | null>(null)
    const [debugInfo, setDebugInfo] = useState<any>(null)

    useEffect(() => {
        const handleCallback = async () => {
            try {
                setStatus("Procesando callback de Okta...")

                // 1. Manejar el callback de Okta
                await oktaAuth.handleLoginRedirect()

                // 2. Obtener el token
                setStatus("Obteniendo token de acceso...")
                const tokenResponse = await oktaAuth.tokenManager.get("accessToken")

                console.log("Token response:", tokenResponse) // Debug log

                if (!tokenResponse) {
                    throw new Error("No se pudo obtener el token de acceso")
                }

                // 3. Extraer el token string - CORREGIDO
                let tokenString: string

                if (typeof tokenResponse === "string") {
                    tokenString = tokenResponse
                } else if (tokenResponse && typeof tokenResponse === "object") {
                    // Intentar diferentes propiedades posibles
                    tokenString =
                        (tokenResponse as any).accessToken ||
                        (tokenResponse as any).value ||
                        (tokenResponse as any).token ||
                        tokenResponse.toString()
                } else {
                    throw new Error("Formato de token no reconocido")
                }

                if (!tokenString) {
                    throw new Error("No se pudo extraer el token string")
                }

                console.log("Token string extraído:", tokenString.substring(0, 50) + "...") // Debug log

                // 4. Validar el token con nuestro backend
                setStatus("Validando token con el servidor...")
                const isValid = await validateTokenWithBackend(tokenString)

                if (isValid) {
                    setStatus("¡Autenticación exitosa! Redirigiendo...")
                    // 5. Solo si la validación es exitosa, redirigir al dashboard
                    setTimeout(() => {
                        router.push("/dashboard")
                    }, 1000)
                } else {
                    throw new Error("El token no pudo ser validado por el servidor")
                }
            } catch (error: any) {
                console.error("Error en callback de Okta:", error)
                setError(error.message)
                setStatus("Error en la autenticación")

                // Redirigir a login después de 3 segundos en caso de error
                setTimeout(() => {
                    router.push("/?error=callback_error")
                }, 3000)
            }
        }

        if (oktaAuth.isLoginRedirect()) {
            handleCallback()
        } else {
            // Si no es un redirect de login, redirigir a la página principal
            router.push("/")
        }
    }, [router])

    // Función mejorada para validar el token con nuestro backend
    const validateTokenWithBackend = async (token: string): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

            console.log("🔍 Validando token con backend...")
            console.log("📍 API URL:", apiUrl)
            console.log("🔑 Token (primeros 50 chars):", token.substring(0, 50) + "...")

            // Información de debug
            const debugData = {
                apiUrl,
                tokenLength: token.length,
                tokenStart: token.substring(0, 50),
                timestamp: new Date().toISOString(),
            }
            setDebugInfo(debugData)

            const response = await fetch(`${apiUrl}/auth/validate`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            console.log("📡 Response status:", response.status)
            console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Token validado exitosamente en el backend:", result)
                return true
            } else {
                // Mejorar el manejo de errores
                let errorData: any = {}
                const contentType = response.headers.get("content-type")

                try {
                    if (contentType && contentType.includes("application/json")) {
                        errorData = await response.json()
                    } else {
                        const textResponse = await response.text()
                        errorData = {
                            message: textResponse || `HTTP ${response.status}`,
                            status: response.status,
                            statusText: response.statusText,
                        }
                    }
                } catch (parseError) {
                    errorData = {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        status: response.status,
                        parseError: parseError,
                    }
                }

                console.error("❌ Error validando token en el backend:")
                console.error("   Status:", response.status)
                console.error("   Status Text:", response.statusText)
                console.error("   Content-Type:", contentType)
                console.error("   Error Data:", errorData)

                // Actualizar el estado de error con más información
                setError(`Backend validation failed: ${response.status} - ${errorData.message || response.statusText}`)

                return false
            }
        } catch (error: any) {
            console.error("❌ Error de red validando token:")
            console.error("   Error type:", error.constructor.name)
            console.error("   Error message:", error.message)
            console.error("   Full error:", error)

            setError(`Network error: ${error.message}`)
            return false
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">Autenticación en progreso</h2>

                <p className="text-gray-600 mb-4">{status}</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                        <p className="text-sm mt-1">Serás redirigido al login en unos segundos...</p>
                    </div>
                )}

                {/* Información de debug */}
                {debugInfo && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-left">
                        <strong>Debug Info:</strong>
                        <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}

                <div className="text-sm text-gray-500">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Conectando con Okta</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${status.includes("token") ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Obteniendo token</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${status.includes("servidor") ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Validando con servidor</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${status.includes("exitosa") ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Acceso autorizado</span>
                        </div>
                    </div>
                </div>

                {/* Botón de debug para probar conexión */}
                <div className="mt-4">
                    <button
                        onClick={async () => {
                            try {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
                                const response = await fetch(`${apiUrl}/public/health`)
                                const result = await response.json()
                                console.log("🌐 Public health check:", result)
                                alert(`Backend conectado: ${result.status}`)
                            } catch (error) {
                                console.error("❌ Backend no disponible:", error)
                                alert(`Backend no disponible: ${error}`)
                            }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        Probar conexión con backend
                    </button>
                </div>
            </div>
        </div>
    )
}
