"use client"

import { Button } from "@/components/ui/button"
import { useStandardCognitoAuth } from "@/hooks/use-standard-cognito-auth"
import { Loader2, LogIn, LogOut } from "lucide-react"

export function CognitoStandardButton() {
    const { isAuthenticated, isLoading, signIn, signOut, user, error } = useStandardCognitoAuth()

    if (isLoading) {
        return (
            <Button disabled variant="outline">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
            </Button>
        )
    }

    if (error) {
        return (
            <Button variant="destructive" onClick={() => window.location.reload()}>
                Error - Reintentar
            </Button>
        )
    }

    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user.profile?.email || user.profile?.name || "Usuario"}</span>
                <Button onClick={signOut} variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        )
    }

    return (
        <Button onClick={signIn} className="bg-orange-600 hover:bg-orange-700">
            <LogIn className="h-4 w-4 mr-2" />
            Login con Cognito (Estándar)
        </Button>
    )
}
