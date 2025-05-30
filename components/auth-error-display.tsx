"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, X } from "lucide-react"
import { useAuthWithErrors } from "@/hooks/use-auth-with-errors"

export function AuthErrorDisplay() {
    const { authError, clearError, signIn } = useAuthWithErrors()

    if (!authError) return null

    const getErrorIcon = () => {
        switch (authError.type) {
            case "signin":
            case "signout":
            case "token_refresh":
                return <AlertCircle className="h-4 w-4" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const getErrorMessage = () => {
        switch (authError.type) {
            case "signin":
                return "Error al iniciar sesión. Por favor, inténtalo de nuevo."
            case "signout":
                return "Error al cerrar sesión. Por favor, inténtalo de nuevo."
            case "token_refresh":
                return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
            default:
                return authError.message
        }
    }

    const showRetryButton = authError.type === "signin" || authError.type === "token_refresh"

    return (
        <Alert variant="destructive" className="relative">
            {getErrorIcon()}
            <AlertDescription className="pr-8">{getErrorMessage()}</AlertDescription>

            <div className="absolute right-2 top-2 flex gap-1">
                {showRetryButton && (
                    <Button variant="ghost" size="sm" onClick={signIn} className="h-6 w-6 p-0 hover:bg-red-100">
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={clearError} className="h-6 w-6 p-0 hover:bg-red-100">
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </Alert>
    )
}
