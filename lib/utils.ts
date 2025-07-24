import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface JWTPayload {
  [key: string]: any
  sub?: string
  iss?: string
  aud?: string | string[]
  exp?: number
  iat?: number
  nbf?: number
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  preferred_username?: string
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    // Decode the payload (second part)
    const payload = parts[1]
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '==='.slice((payload.length + 3) % 4)
    
    // Decode base64
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    
    // Parse JSON
    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export function getJWTFromURL(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.substring(1)
  const hashParams = new URLSearchParams(hash)
  
  // Check common JWT parameter names
  const jwtParamNames = ['jwt', 'token', 'saml_jwt', 'saml_token', 'assertion']
  
  // Check URL parameters first
  for (const paramName of jwtParamNames) {
    const jwt = urlParams.get(paramName)
    if (jwt) return jwt
  }
  
  // Check hash parameters
  for (const paramName of jwtParamNames) {
    const jwt = hashParams.get(paramName)
    if (jwt) return jwt
  }
  
  return null
}

export function getTokenFromDashboardURL(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('token')
}

export function clearTokenFromURL(): void {
  if (typeof window === 'undefined') return
  
  // Create a new URL without the token parameter
  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  
  // Replace the current URL without reloading the page
  window.history.replaceState({}, '', url.toString())
}

export interface TokenValidationResult {
  success: boolean
  data?: any
  error?: string
  status?: number
}

export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    const response = await fetch('http://localhost:8080/api/user/token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${data.message || response.statusText}`,
        status: response.status,
        data
      }
    }

    return {
      success: true,
      data,
      status: response.status
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión'
    }
  }
}

export async function validateUserPermissions(token: string, sessionToken?: string): Promise<TokenValidationResult> {
  try {
    // Por ahora, usar el mismo token para ambos headers
    const effectiveSessionToken = sessionToken || token
    
    const requestBody = {
      resource: "/cc/model-configurator/products-operations/v1/products/searches",
      action: "POST",
      role: "LD_BUSINESS_ADMIN"
    }
    
    const response = await fetch('http://localhost:8080/api/user/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Session-Token': effectiveSessionToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${data.message || response.statusText}`,
        status: response.status,
        data
      }
    }

    return {
      success: true,
      data,
      status: response.status
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión'
    }
  }
}
