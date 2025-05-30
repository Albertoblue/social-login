import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center">Términos y Condiciones</CardTitle>
                        <CardDescription className="text-center">
                            Última actualización: {new Date().toLocaleDateString("es-ES")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                            <p className="text-gray-600">
                                Al acceder y utilizar esta aplicación de demostración de autenticación social, usted acepta estar sujeto
                                a estos términos y condiciones de uso.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
                            <p className="text-gray-600">
                                Esta es una aplicación de demostración que implementa autenticación mediante OIDC/OAuth 2.0 y SAML 2.0
                                utilizando Okta como proveedor de identidad.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Registro de Cuenta</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Debe proporcionar información precisa y completa durante el registro</li>
                                <li>Es responsable de mantener la confidencialidad de su cuenta</li>
                                <li>Debe notificar inmediatamente cualquier uso no autorizado</li>
                                <li>Solo puede crear una cuenta por persona</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Uso Aceptable</h2>
                            <p className="text-gray-600 mb-2">No está permitido:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Usar la aplicación para actividades ilegales</li>
                                <li>Intentar acceder a cuentas de otros usuarios</li>
                                <li>Interferir con el funcionamiento de la aplicación</li>
                                <li>Realizar ingeniería inversa del código</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Privacidad y Datos</h2>
                            <p className="text-gray-600">
                                Su privacidad es importante para nosotros. Consulte nuestra
                                <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                                    Política de Privacidad
                                </Link>{" "}
                                para entender cómo recopilamos y utilizamos su información.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Limitación de Responsabilidad</h2>
                            <p className="text-gray-600">
                                Esta aplicación se proporciona "tal como está" con fines de demostración. No garantizamos la
                                disponibilidad continua del servicio ni nos hacemos responsables de cualquier pérdida de datos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Modificaciones</h2>
                            <p className="text-gray-600">
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en
                                vigor inmediatamente después de su publicación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Contacto</h2>
                            <p className="text-gray-600">
                                Si tiene preguntas sobre estos términos, puede contactarnos en:
                                <a href="mailto:support@example.com" className="text-blue-600 hover:underline ml-1">
                                    support@example.com
                                </a>
                            </p>
                        </section>

                        <div className="flex justify-center pt-8">
                            <Button asChild>
                                <Link href="/register">Volver al Registro</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
