"use client"

import { useOktaAuth } from "./use-okta-auth"
import { useSAMLAuth } from "./use-saml-auth"

export function useUnifiedAuth() {
    const oidcAuth = useOktaAuth()
    const samlAuth = useSAMLAuth()

    // Determinar si está autenticado por cualquier método
    const isAuthenticated = oidcAuth.isAuthenticated || samlAuth.isAuthenticated
    const loading = oidcAuth.loading || samlAuth.loading
    const error = oidcAuth.error || samlAuth.error

    // Información del usuario (priorizar OIDC si ambos están disponibles)
    const user = oidcAuth.isAuthenticated ? oidcAuth.user : samlAuth.samlAttributes
    const authMethod = oidcAuth.isAuthenticated ? "OIDC" : samlAuth.isAuthenticated ? "SAML" : null

    // Función de logout unificada
    const signOut = async () => {
        if (oidcAuth.isAuthenticated) {
            await oidcAuth.signOut()
        }
        if (samlAuth.isAuthenticated) {
            await samlAuth.logoutFromSAML()
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

        // Métodos unificados
        signOut,
    }
}
