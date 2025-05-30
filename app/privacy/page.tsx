import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center">Política de Privacidad</CardTitle>
                        <CardDescription className="text-center">
                            Última actualización: {new Date().toLocaleDateString("es-ES")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-medium">Información de Registro:</h3>
                                    <ul className="list-disc list-inside text-gray-600 mt-1">
                                        <li>Nombre y apellido</li>
                                        <li>Dirección de correo electrónico</li>
                                        <li>Empresa y cargo (opcional)</li>
                                        <li>Preferencias de marketing</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium">Información de Autenticación:</h3>
                                    <ul className="list-disc list-inside text-gray-600 mt-1">
                                        <li>Tokens de acceso (temporales)</li>
                                        <li>Información de sesión</li>
                                        <li>Logs de autenticación</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Cómo Utilizamos su Información</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Proporcionar y mantener nuestro servicio de demostración</li>
                                <li>Autenticar su identidad y gestionar su cuenta</li>
                                <li>Enviar comunicaciones relacionadas con el servicio</li>
                                <li>Mejorar la funcionalidad de la aplicación</li>
                                <li>Cumplir con obligaciones legales</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Compartir Información</h2>
                            <p className="text-gray-600 mb-2">
                                No vendemos ni alquilamos su información personal. Podemos compartir información en las siguientes
                                circunstancias:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Con Okta para servicios de autenticación</li>
                                <li>Cuando sea requerido por ley</li>
                                <li>Para proteger nuestros derechos y seguridad</li>
                                <li>Con su consentimiento explícito</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Seguridad de Datos</h2>
                            <p className="text-gray-600 mb-2">Implementamos medidas de seguridad técnicas y organizativas:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Cifrado de datos en tránsito y en reposo</li>
                                <li>Autenticación multifactor</li>
                                <li>Monitoreo de seguridad continuo</li>
                                <li>Acceso limitado a datos personales</li>
                                <li>Auditorías de seguridad regulares</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Retención de Datos</h2>
                            <p className="text-gray-600">
                                Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos
                                descritos en esta política, a menos que la ley requiera un período de retención más largo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Sus Derechos</h2>
                            <p className="text-gray-600 mb-2">Usted tiene derecho a:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Acceder a su información personal</li>
                                <li>Corregir datos inexactos</li>
                                <li>Solicitar la eliminación de sus datos</li>
                                <li>Oponerse al procesamiento de sus datos</li>
                                <li>Portabilidad de datos</li>
                                <li>Retirar el consentimiento en cualquier momento</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Cookies y Tecnologías Similares</h2>
                            <p className="text-gray-600">
                                Utilizamos cookies y tecnologías similares para mejorar su experiencia, mantener sesiones de usuario y
                                analizar el uso de la aplicación. Puede controlar las cookies a través de la configuración de su
                                navegador.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Transferencias Internacionales</h2>
                            <p className="text-gray-600">
                                Sus datos pueden ser transferidos y procesados en países fuera de su jurisdicción. Nos aseguramos de que
                                dichas transferencias cumplan con las leyes de protección de datos aplicables.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">9. Cambios a esta Política</h2>
                            <p className="text-gray-600">
                                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios
                                significativos publicando la nueva política en esta página y actualizando la fecha de "última
                                actualización".
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">10. Contacto</h2>
                            <p className="text-gray-600">
                                Si tiene preguntas sobre esta política de privacidad o el manejo de sus datos, puede contactarnos en:
                            </p>
                            <div className="mt-2 text-gray-600">
                                <p>
                                    Email:{" "}
                                    <a href="mailto:privacy@example.com" className="text-blue-600 hover:underline">
                                        privacy@example.com
                                    </a>
                                </p>
                                <p>Teléfono: +1 (555) 123-4567</p>
                            </div>
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
