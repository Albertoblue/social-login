"use client"

import { useOktaAuth } from "./use-okta-auth"
import { useSAMLAuth } from "./use-saml-auth"
import { useCognitoAuth } from "./use-cognito-auth"

export function useUnifiedAuth() {
    const oidcAuth = useOktaAuth()
    const samlAuth = useSAMLAuth()
    const cognitoAuth = useCognitoAuth()

    // Determinar si está autenticado por cualquier método
    const isAuthenticated = oidcAuth.isAuthenticated || samlAuth.isAuthenticated || cognitoAuth.isAuthenticated
    const loading = oidcAuth.loading || samlAuth.loading || cognitoAuth.loading
    const error = oidcAuth.error || samlAuth.error || cognitoAuth.error

    // Debug logs
    console.log("🔍 Estado de autenticación unificado:", {
        oidc: oidcAuth.isAuthenticated,
        saml: samlAuth.isAuthenticated,
        cognito: cognitoAuth.isAuthenticated,
        isAuthenticated,
        loading: { oidc: oidcAuth.loading, saml: samlAuth.loading, cognito: cognitoAuth.loading },
        cognitoUser: cognitoAuth.user?.email,
        cognitoToken: !!cognitoAuth.accessToken
    })

    // Información del usuario (priorizar OIDC, luego SAML, luego Cognito)
    const user = oidcAuth.isAuthenticated 
        ? oidcAuth.user 
        : samlAuth.isAuthenticated 
            ? samlAuth.samlAttributes 
            : cognitoAuth.isAuthenticated
                ? cognitoAuth.user
                : null
    const authMethod = oidcAuth.isAuthenticated 
        ? "OIDC" 
        : samlAuth.isAuthenticated 
            ? "SAML" 
            : cognitoAuth.isAuthenticated
                ? "COGNITO"
                : null

    // Función de logout unificada
    const signOut = async () => {
        if (oidcAuth.isAuthenticated) {
            await oidcAuth.signOut()
        }
        if (samlAuth.isAuthenticated) {
            await samlAuth.logoutFromSAML()
        }
        if (cognitoAuth.isAuthenticated) {
            await cognitoAuth.signOut()
        }
    }

    return {
        // Estado unificado
        isAuthenticated,
        loading,
        error,
        user,
        authMethod,

        // Métodos específicos
        oidc: oidcAuth,
        saml: samlAuth,
        cognito: cognitoAuth,

        // Métodos unificados
        signOut,
    }
}
