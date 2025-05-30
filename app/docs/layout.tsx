import type React from "react"
export default function DocsLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Documentación</h1>
            <div className="flex flex-col md:flex-row gap-6">
    <div className="md:w-64 flex-shrink-0">
    <nav className="sticky top-8">
    <ul className="space-y-1">
    <li>
        <a href="/docs" className="block p-2 hover:bg-gray-100 rounded">
    Inicio
    </a>
    </li>
    <li>
    <a href="/docs/setup" className="block p-2 hover:bg-gray-100 rounded">
    Configuración
    </a>
    </li>
    <li>
    <a href="/docs/architecture" className="block p-2 hover:bg-gray-100 rounded">
    Arquitectura
    </a>
    </li>
    <li>
    <a href="/docs/api" className="block p-2 hover:bg-gray-100 rounded">
        API Endpoints
    </a>
    </li>
    <li>
    <a href="/docs/environment" className="block p-2 hover:bg-gray-100 rounded">
        Variables de Entorno
    </a>
    </li>
    <li>
    <a href="/docs/troubleshooting" className="block p-2 hover:bg-gray-100 rounded">
        Solución de Problemas
    </a>
    </li>
    <li>
    <a href="/docs/testing" className="block p-2 hover:bg-gray-100 rounded">
    Testing
    </a>
    </li>
    <li>
    <a href="/docs/export" className="block p-2 hover:bg-gray-100 rounded text-blue-600">
        Exportar PDF
    </a>
    </li>
    </ul>
    </nav>
    </div>
    <div className="flex-1 prose max-w-none">{children}</div>
        </div>
        </div>
)
}
