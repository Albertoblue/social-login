"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ClientOnlyAuthProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function ClientOnlyAuth({ children, fallback = null }: ClientOnlyAuthProps) {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
