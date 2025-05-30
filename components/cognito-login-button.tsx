"use client"

import { Button } from "@/components/ui/button"
import { useCognitoAuth } from "@/hooks/use-cognito-auth"
import type { ButtonProps } from "@/components/ui/button"
import { useState } from "react"

interface CognitoLoginButtonProps extends ButtonProps {
    onClick?: () => void
    loading?: boolean
}

export function CognitoLoginButton({ onClick, loading: externalLoading, ...props }: CognitoLoginButtonProps) {
    const { signIn, loading: internalLoading } = useCognitoAuth()
    const [isHovered, setIsHovered] = useState(false)

    // Usar loading externo si se proporciona, de lo contrario usar el interno
    const isLoading = externalLoading !== undefined ? externalLoading : internalLoading

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            signIn()
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M21.5 0C9.62632 0 0 9.62632 0 21.5C0 33.3737 9.62632 43 21.5 43C33.3737 43 43 33.3737 43 21.5C43 9.62632 33.3737 0 21.5 0Z"
                    fill={isHovered ? "#FF9900" : "#FF9900"}
                />
                <path
                    d="M25.9267 21.5C25.9267 23.9484 23.9484 25.9267 21.5 25.9267C19.0516 25.9267 17.0733 23.9484 17.0733 21.5C17.0733 19.0516 19.0516 17.0733 21.5 17.0733C23.9484 17.0733 25.9267 19.0516 25.9267 21.5Z"
                    fill="white"
                />
                <path
                    d="M34.4 21.5C34.4 28.4094 28.4094 34.4 21.5 34.4C14.5906 34.4 8.6 28.4094 8.6 21.5C8.6 14.5906 14.5906 8.6 21.5 8.6C28.4094 8.6 34.4 14.5906 34.4 21.5ZM21.5 30.1C26.0347 30.1 29.7 26.4347 29.7 21.9C29.7 17.3653 26.0347 13.7 21.5 13.7C16.9653 13.7 13.3 17.3653 13.3 21.9C13.3 26.4347 16.9653 30.1 21.5 30.1Z"
                    stroke="white"
                    strokeWidth="2"
                />
            </svg>
            {isLoading ? "Conectando..." : "Continuar con AWS Cognito"}
        </Button>
    )
}
