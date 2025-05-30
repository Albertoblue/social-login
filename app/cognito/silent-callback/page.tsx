"use client"

import { useEffect } from "react"

export default function SilentCallbackPage() {
    useEffect(() => {
        // Esta página maneja la renovación silenciosa de tokens
        if (typeof window !== "undefined") {
            // react-oidc-context maneja esto automáticamente
            console.log("Silent callback processed")
        }
    }, [])

    return <div>Processing...</div>
}
