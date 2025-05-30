"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorageService } from "@/lib/storage-service"

export default function CognitoDebug() {
    const [storageData, setStorageData] = useState<Record<string, any>>({})
    const [showDebug, setShowDebug] = useState(false)

    useEffect(() => {
        if (showDebug) {
            refreshStorageData()
        }
    }, [showDebug])

    const refreshStorageData = () => {
        try {
            // Recopilar datos de sessionStorage
            const sessionData: Record<string, any> = {}
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key) {
                    sessionData[key] = sessionStorage.getItem(key)
                }
            }

            // Recopilar datos de localStorage
            const localData: Record<string, any> = {}
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key) {
                    localData[key] = localStorage.getItem(key)
                }
            }

            // Recopilar cookies
            const cookieData: Record<string, string> = {}
            document.cookie.split(";").forEach((cookie) => {
                const [key, value] = cookie.trim().split("=")
                if (key) cookieData[key] = value || ""
            })

            // Datos del servicio de almacenamiento
            const serviceData: Record<string, any> = {
                cognito_state: StorageService.getItem("cognito_state"),
            }

            setStorageData({
                sessionStorage: sessionData,
                localStorage: localData,
                cookies: cookieData,
                storageService: serviceData,
            })
        } catch (error) {
            console.error("Error al recopilar datos de almacenamiento:", error)
            setStorageData({ error: "Error al recopilar datos" })
        }
    }

    const clearStorage = () => {
        try {
            // Limpiar sessionStorage
            sessionStorage.clear()

            // Limpiar localStorage relacionado con Cognito
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.includes("cognito") || key.includes("temp_"))) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key))

            // Limpiar cookies relacionadas
            document.cookie = "cognito_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

            refreshStorageData()
        } catch (error) {
            console.error("Error al limpiar almacenamiento:", error)
        }
    }

    const testStateStorage = () => {
        try {
            const testState = "test_" + Math.random().toString(36).substring(2, 15)
            StorageService.setItem("cognito_state", testState)
            refreshStorageData()
        } catch (error) {
            console.error("Error al probar almacenamiento:", error)
        }
    }

    return (
        <div className="mt-4">
            <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
                {showDebug ? "Ocultar Debug" : "Mostrar Debug"}
            </Button>

            {showDebug && (
                <Card className="mt-2">
                    <CardHeader>
                        <CardTitle>Cognito Debug</CardTitle>
                        <CardDescription>Información de depuración para Cognito</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Button size="sm" variant="outline" onClick={refreshStorageData}>
                                Actualizar
                            </Button>
                            <Button size="sm" variant="outline" onClick={clearStorage}>
                                Limpiar Storage
                            </Button>
                            <Button size="sm" variant="outline" onClick={testStateStorage}>
                                Probar State
                            </Button>
                        </div>

                        <div className="text-xs">
                            <h3 className="font-bold mb-1">Datos de almacenamiento:</h3>
                            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
                {JSON.stringify(storageData, null, 2)}
              </pre>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
