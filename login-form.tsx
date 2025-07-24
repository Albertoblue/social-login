"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Linkedin, GitBranch, AlertCircle } from "lucide-react"
import { SimpleSAMLButton } from "@/components/simple-saml-button"
import { CognitoLoginButton } from "@/components/oidc-login-buttons"
import { ClientOnlyAuth } from "@/components/client-only-auth"
import { useOktaAuth } from "@/hooks/use-okta-auth"

export default function LoginForm() {
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login with email/password")
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa a tu cuenta usando tu email o redes sociales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulario de email y contraseña */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@ejemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>

            {/* Botones de autenticación social */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("google")}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </Button>

              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("facebook")}>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continuar con Facebook
              </Button>

              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("linkedin")}>
                <Linkedin className="mr-2 h-4 w-4" />
                Continuar con LinkedIn
              </Button>

              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("gitlab")}>
                <GitBranch className="mr-2 h-4 w-4" />
                Continuar con GitLab
              </Button>

              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("x")}>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Continuar con X
              </Button>

              {/* Separador para proveedores empresariales */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Proveedores Empresariales</span>
                </div>
              </div>

              {/* Componentes que requieren contexto de autenticación */}
              <ClientOnlyAuth
                  fallback={
                    <Button variant="outline" className="w-full" disabled>
                      Cargando autenticación...
                    </Button>
                  }
              >
                <OktaLoginButton />
                <CognitoLoginButton />
              </ClientOnlyAuth>

              {/* Botones de autenticación directa */}
              <DirectOktaLoginButtons />
              <DirectCognitoLoginButtons />

              {/* Botón de SAML */}
              <SimpleSAMLButton className="w-full" variant="outline" idpName="Okta con SAML 2.0" />

              {/* Health Check */}
              <HealthCheckButton />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="underline hover:text-primary">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

// Componente simple para Okta que no depende del contexto OIDC
function OktaLoginButton() {
  const { signIn: oktaSignIn, loading: oktaLoading, error: oktaError } = useOktaAuth()

  const handleOktaLogin = async () => {
    try {
      await oktaSignIn()
    } catch (error) {
      console.error("Error en login con Okta:", error)
    }
  }

  return (
      <>
        {oktaError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Okta: {oktaError}</AlertDescription>
            </Alert>
        )}
        <Button variant="outline" className="w-full" onClick={handleOktaLogin} disabled={oktaLoading}>
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          {oktaLoading ? "Conectando..." : "Continuar con Okta (OIDC)"}
        </Button>
      </>
  )
}

// Botones directos para Okta
function DirectOktaLoginButtons() {
  const handleOktaLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/okta"
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleOktaLogin}>
      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
      Okta - OAuth2 Direct
    </Button>
  )
}

// Botones directos para Cognito
function DirectCognitoLoginButtons() {
  const handleCognitoLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/cognito"
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleCognitoLogin}>
      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.75 2.5h-13.5A2.75 2.75 0 0 0 2.5 5.25v13.5A2.75 2.75 0 0 0 5.25 21.5h13.5A2.75 2.75 0 0 0 21.5 18.75V5.25A2.75 2.75 0 0 0 18.75 2.5zm.75 16.25c0 .414-.336.75-.75.75H5.25a.75.75 0 0 1-.75-.75V5.25c0-.414.336-.75.75-.75h13.5c.414 0 .75.336.75.75v13.5z"/>
      </svg>
      Cognito - OAuth2 Direct
    </Button>
  )
}

// Botón de Health Check
function HealthCheckButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [healthData, setHealthData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleHealthCheck = async () => {
    setIsLoading(true)
    setError(null)
    setHealthData(null)
    setIsModalOpen(true)

    try {
      const response = await fetch("http://localhost:8080/api/public/health")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setHealthData(data)
    } catch (error: any) {
      setError(error.message || "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="secondary" className="w-full" onClick={handleHealthCheck}>
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Verificar Configuración (Health Check)
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Health Check - Estado de la API</DialogTitle>
            <DialogDescription>
              Resultado de la verificación del estado de la API backend
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <p>Verificando estado de la API...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {healthData && (
              <div className="space-y-4">
                <Alert>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <AlertDescription>
                    <strong>Conexión exitosa:</strong> La API está respondiendo correctamente
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">Respuesta de la API:</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(healthData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
