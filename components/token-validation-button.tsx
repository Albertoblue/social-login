"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Key } from "lucide-react"
import { validateToken, type TokenValidationResult } from "@/lib/utils"

interface TokenValidationButtonProps {
  token: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  onAccessTokenReceived?: (accessToken: string) => void
}

export function TokenValidationButton({ 
  token, 
  variant = "outline", 
  className = "", 
  disabled = false,
  children,
  onAccessTokenReceived
}: TokenValidationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleValidateToken = async () => {
    setIsLoading(true)
    setValidationResult(null)
    setIsModalOpen(true)

    const result = await validateToken(token)
    setValidationResult(result)
    
    // Extraer access_token si la validación fue exitosa
    if (result.success) {
      console.log("✅ Validación exitosa. Callback disponible:", !!onAccessTokenReceived)
      console.log("📋 Datos de respuesta:", result.data)
      
      if (onAccessTokenReceived) {
        let sessionToken = null
        
        // Buscar access_token en diferentes ubicaciones posibles
        if (result.data?.access_token && typeof result.data.access_token === 'string') {
          // Formato directo: { access_token: "..." }
          sessionToken = result.data.access_token
          console.log("🔑 Session token extraído de access_token (directo):", sessionToken.substring(0, 50) + "...")
        } else if (result.data?.token?.access_token && typeof result.data.token.access_token === 'string') {
          // Formato anidado: { token: { access_token: "..." } }
          sessionToken = result.data.token.access_token
          console.log("🔑 Session token extraído de token.access_token (anidado):", sessionToken.substring(0, 50) + "...")
        } else {
          console.log("❌ No se encontró access_token en ningún formato esperado")
          console.log("🔍 Estructura de respuesta:", result.data)
          console.log("⚠️ No se puede activar validación de usuario sin access_token")
        }
        
        if (sessionToken) {
          console.log("🔄 Llamando callback onAccessTokenReceived...")
          onAccessTokenReceived(sessionToken)
          console.log("✅ Callback ejecutado")
        }
      }
    } else {
      console.log("❌ Validación falló:", result.error)
    }
    
    setIsLoading(false)
  }

  const defaultButtonText = (
    <>
      <Key className="h-4 w-4 mr-2" />
      Validar Token
    </>
  )

  return (
    <>
      <Button 
        variant={variant}
        className={className}
        onClick={handleValidateToken}
        disabled={disabled || !token}
      >
        {children || defaultButtonText}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validación de Token</DialogTitle>
            <DialogDescription>
              Resultado de la validación del token en el endpoint /api/user/token
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <p>Validando token...</p>
              </div>
            )}

            {validationResult && (
              <div className="space-y-4">
                {validationResult.success ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Token válido:</strong> La validación fue exitosa (HTTP {validationResult.status})
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Token inválido:</strong> {validationResult.error}
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

                {/* Información del token */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-3 text-blue-800">Información del Token:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Primeros 50 caracteres:</strong></p>
                    <p className="font-mono text-xs bg-white p-2 rounded border break-all">
                      {token.substring(0, 50)}...
                    </p>
                    <p><strong>Longitud:</strong> {token.length} caracteres</p>
                    <p><strong>Endpoint:</strong> GET /api/user/token</p>
                    <p><strong>Autorización:</strong> Bearer {token.substring(0, 20)}...</p>
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