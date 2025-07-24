"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Shield } from "lucide-react"
import { validateUserPermissions, type TokenValidationResult } from "@/lib/utils"

interface UserValidationButtonProps {
  token: string
  sessionToken?: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  hasValidatedToken?: boolean
}

export function UserValidationButton({ 
  token, 
  sessionToken,
  variant = "outline", 
  className = "", 
  disabled = false,
  children,
  hasValidatedToken = false
}: UserValidationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleValidateUser = async () => {
    if (!sessionToken) {
      console.error("❌ No se puede validar usuario sin session token")
      return
    }

    setIsLoading(true)
    setValidationResult(null)
    setIsModalOpen(true)

    console.log("🛡️ Validando usuario con:", {
      bearerToken: token.substring(0, 30) + "...",
      sessionToken: sessionToken.substring(0, 30) + "..."
    })

    const result = await validateUserPermissions(token, sessionToken)
    setValidationResult(result)
    setIsLoading(false)
  }

  const defaultButtonText = (
    <>
      <Shield className="h-4 w-4 mr-2" />
      Validar Usuario
    </>
  )

  const effectiveSessionToken = sessionToken // NO usar fallback al token original
  const isDisabled = disabled || !token || !hasValidatedToken || !sessionToken
  
  console.log("🛡️ UserValidationButton state:", {
    disabled,
    hasToken: !!token,
    hasValidatedToken,
    hasSessionToken: !!sessionToken,
    isDisabled
  })

  return (
    <>
      <Button 
        variant={variant}
        className={className}
        onClick={handleValidateUser}
        disabled={isDisabled}
      >
        {children || defaultButtonText}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validación de Usuario</DialogTitle>
            <DialogDescription>
              Resultado de la validación del usuario en el endpoint /api/user/validate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <p>Validando usuario...</p>
              </div>
            )}

            {validationResult && (
              <div className="space-y-4">
                {validationResult.success ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Usuario válido:</strong> La validación fue exitosa (HTTP {validationResult.status})
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Validación fallida:</strong> {validationResult.error}
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.data && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Respuesta del servidor:</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 whitespace-pre-wrap">
                      {JSON.stringify(validationResult.data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Información de la petición */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-3 text-blue-800">Detalles de la Petición:</h4>
                  <div className="text-sm space-y-3">
                    <div>
                      <p><strong>Método:</strong> POST</p>
                      <p><strong>Endpoint:</strong> /api/user/validate</p>
                      <p><strong>URL:</strong> http://localhost:8080/api/user/validate</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p><strong>Headers enviados:</strong></p>
                      <div className="bg-white p-3 rounded border font-mono text-xs space-y-1">
                        <p><strong>Authorization:</strong> Bearer {token.substring(0, 30)}...</p>
                        <p><strong>X-Session-Token:</strong> {effectiveSessionToken ? effectiveSessionToken.substring(0, 30) + "..." : "No disponible"}</p>
                        <p><strong>Content-Type:</strong> application/json</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p><strong>Body de la petición:</strong></p>
                      <div className="bg-white p-3 rounded border">
                        <pre className="text-xs font-mono text-gray-800">
{JSON.stringify({
  resource: "/cc/model-configurator/products-operations/v1/products/searches",
  action: "POST",
  role: "LD_BUSINESS_ADMIN"
}, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p><strong>Token Bearer:</strong></p>
                        <p className="font-mono text-xs bg-white p-2 rounded border break-all">
                          {token.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Longitud: {token.length} caracteres</p>
                      </div>
                      
                      <div>
                        <p><strong>Session Token (X-Session-Token):</strong></p>
                        <p className="font-mono text-xs bg-white p-2 rounded border break-all">
                          {effectiveSessionToken ? effectiveSessionToken.substring(0, 50) + "..." : "No disponible"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {effectiveSessionToken ? (
                            <>
                              Longitud: {effectiveSessionToken.length} caracteres
                              {effectiveSessionToken === token ? " (mismo que Bearer)" : " (access_token de validación)"}
                            </>
                          ) : (
                            "Session token requerido - debe validar token primero"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
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