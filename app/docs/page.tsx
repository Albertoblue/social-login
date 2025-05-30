import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Download, Github } from "lucide-react"

export default function DocsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-4">Documentación del Proyecto</h1>
                <p className="text-gray-600 mb-6">
                    Bienvenido a la documentación completa del proyecto de autenticación con OIDC y SAML. Esta guía te ayudará a
                    entender, configurar y mantener el proyecto.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/docs/setup" className="no-underline">
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">🔧 Configuración</h2>
                        <p className="text-gray-600">Guía paso a paso para configurar Okta, variables de entorno y el proyecto.</p>
                    </div>
                </Link>

                <Link href="/docs/architecture" className="no-underline">
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">🏗️ Arquitectura</h2>
                        <p className="text-gray-600">Diagramas y explicaciones de la arquitectura del sistema.</p>
                    </div>
                </Link>

                <Link href="/docs/api" className="no-underline">
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">🔌 API Endpoints</h2>
                        <p className="text-gray-600">Documentación completa de todos los endpoints disponibles.</p>
                    </div>
                </Link>

                <Link href="/docs/troubleshooting" className="no-underline">
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">🔍 Solución de Problemas</h2>
                        <p className="text-gray-600">Guía para resolver problemas comunes y errores.</p>
                    </div>
                </Link>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
                <Button variant="outline" asChild>
                    <Link href="/docs/export">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar como PDF
                    </Link>
                </Button>

                <Button variant="outline" asChild>
                    <a href="https://github.com/yourusername/your-repo/tree/main/docs" target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Ver en GitHub
                    </a>
                </Button>

                <Button variant="outline" asChild>
                    <a href="/docs/all" target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver todo en una página
                    </a>
                </Button>
            </div>
        </div>
    )
}
