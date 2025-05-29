"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUnifiedAuth } from "@/hooks/use-unified-auth"
import LoginForm from "../login-form"
import { HydrationWrapper } from "@/components/hydration-wrapper"

function HomePage() {
    const { isAuthenticated, loading, authMethod } = useUnifiedAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirigir si está autenticado por cualquier método
        if (!loading && isAuthenticated) {
            console.log(`✅ Usuario autenticado vía ${authMethod} - redirigiendo al dashboard`)
            router.push("/dashboard")
        }
    }, [isAuthenticated, loading, authMethod, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <LoginForm />
    }

    return null
}

export default function Page() {
    return (
        <HydrationWrapper
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando...</p>
                    </div>
                </div>
            }
        >
            <HomePage />
        </HydrationWrapper>
    )
}
