"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Eye, EyeOff, Linkedin } from "lucide-react"
import { useOktaAuth } from "@/hooks/use-okta-auth"
import Link from "next/link"

interface RegisterFormData {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    company: string
    jobTitle: string
    acceptTerms: boolean
    acceptMarketing: boolean
}

interface RegisterResponse {
    success: boolean
    message: string
    userId?: string
    activationRequired?: boolean
}

export default function RegisterForm() {
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        company: "",
        jobTitle: "",
        acceptTerms: false,
        acceptMarketing: false,
    })

    const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [registerResult, setRegisterResult] = useState<RegisterResponse | null>(null)

    const { signIn: oktaSignIn, loading: oktaLoading, error: oktaError } = useOktaAuth()

    const validateForm = (): boolean => {
        const newErrors: Partial<RegisterFormData> = {}

        // Validar nombre
        if (!formData.firstName.trim()) {
            newErrors.firstName = "El nombre es requerido"
        }

        // Validar apellido
        if (!formData.lastName.trim()) {
            newErrors.lastName = "El apellido es requerido"
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
            newErrors.email = "El email es requerido"
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "El email no es válido"
        }

        // Validar contraseña
        if (!formData.password) {
            newErrors.password = "La contraseña es requerida"
        } else if (formData.password.length < 8) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
        }

        // Validar confirmación de contraseña
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirma tu contraseña"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden"
        }

        // Validar términos y condiciones
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = false
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        setRegisterResult(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    company: formData.company,
                    jobTitle: formData.jobTitle,
                    acceptMarketing: formData.acceptMarketing,
                }),
            })

            const result: RegisterResponse = await response.json()

            if (response.ok && result.success) {
                setRegisterResult(result)
            } else {
                setRegisterResult({
                    success: false,
                    message: result.message || "Error al crear la cuenta. Inténtalo de nuevo.",
                })
            }
        } catch (error) {
            console.error("Error en registro:", error)
            setRegisterResult({
                success: false,
                message: "Error de conexión. Verifica tu conexión a internet.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialRegister = (provider: string) => {
        console.log(`Registro con ${provider}`)
        // Implementar lógica de registro social
    }

    const handleOktaRegister = async () => {
        try {
            await oktaSignIn()
        } catch (error) {
            console.error("Error en registro con Okta:", error)
        }
    }

    // Si el registro fue exitoso, mostrar mensaje de confirmación
    if (registerResult?.success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">¡Cuenta Creada!</CardTitle>
                    <CardDescription>
                        {registerResult.activationRequired
                            ? "Hemos enviado un email de activación a tu correo electrónico."
                            : "Tu cuenta ha sido creada exitosamente."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-gray-600">
                        {registerResult.activationRequired ? (
                            <>
                                <p>Revisa tu bandeja de entrada y haz clic en el enlace de activación para completar el registro.</p>
                                <p className="mt-2">
                                    ¿No recibiste el email? <button className="text-blue-600 hover:underline">Reenviar</button>
                                </p>
                            </>
                        ) : (
                            <p>Ya puedes iniciar sesión con tu nueva cuenta.</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button asChild className="flex-1">
                            <Link href="/login">Iniciar Sesión</Link>
                        </Button>
                        {!registerResult.activationRequired && (
                            <Button variant="outline" asChild className="flex-1">
                                <Link href="/dashboard">Ir al Dashboard</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
                <CardDescription className="text-center">Únete a nuestra plataforma y comienza tu experiencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mostrar errores de registro */}
                {registerResult && !registerResult.success && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{registerResult.message}</AlertDescription>
                    </Alert>
                )}

                {/* Mostrar errores de Okta */}
                {oktaError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{oktaError}</AlertDescription>
                    </Alert>
                )}

                {/* Registro con redes sociales */}
                <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => handleSocialRegister("google")}>
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
                        Registrarse con Google
                    </Button>

                    <Button variant="outline" className="w-full" onClick={() => handleSocialRegister("linkedin")}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Registrarse con LinkedIn
                    </Button>

                    <Button variant="outline" className="w-full" onClick={handleOktaRegister} disabled={oktaLoading}>
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                        {oktaLoading ? "Conectando..." : "Registrarse con Okta"}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">O regístrate con email</span>
                    </div>
                </div>

                {/* Formulario de registro */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre *</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Juan"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className={errors.firstName ? "border-red-500" : ""}
                                required
                            />
                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido *</Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Pérez"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                className={errors.lastName ? "border-red-500" : ""}
                                required
                            />
                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                            required
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña *</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        <p className="text-xs text-gray-500">Mínimo 8 caracteres, incluye mayúscula, minúscula y número</p>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Empresa</Label>
                            <Input
                                id="company"
                                type="text"
                                placeholder="Mi Empresa S.A."
                                value={formData.company}
                                onChange={(e) => handleInputChange("company", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Cargo</Label>
                            <Select onValueChange={(value) => handleInputChange("jobTitle", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="developer">Desarrollador</SelectItem>
                                    <SelectItem value="designer">Diseñador</SelectItem>
                                    <SelectItem value="manager">Gerente</SelectItem>
                                    <SelectItem value="analyst">Analista</SelectItem>
                                    <SelectItem value="consultant">Consultor</SelectItem>
                                    <SelectItem value="student">Estudiante</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="acceptTerms"
                                checked={formData.acceptTerms}
                                onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                                className={errors.acceptTerms ? "border-red-500" : ""}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="acceptTerms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Acepto los{" "}
                                    <Link href="/terms" className="text-blue-600 hover:underline">
                                        términos y condiciones
                                    </Link>{" "}
                                    y la{" "}
                                    <Link href="/privacy" className="text-blue-600 hover:underline">
                                        política de privacidad
                                    </Link>
                                    *
                                </Label>
                                {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="acceptMarketing"
                                checked={formData.acceptMarketing}
                                onCheckedChange={(checked) => handleInputChange("acceptMarketing", checked as boolean)}
                            />
                            <Label
                                htmlFor="acceptMarketing"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Quiero recibir noticias y ofertas por email
                            </Label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="underline hover:text-primary">
                        Inicia sesión aquí
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
