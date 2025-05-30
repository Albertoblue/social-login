import fs from "fs/promises"
import path from "path"
import { notFound } from "next/navigation"
import MarkdownRenderer from "@/components/markdown-renderer"

// Mapeo de slugs a archivos markdown
const slugToFile = {
    setup: "OKTA_SETUP.md",
    architecture: "ARCHITECTURE.md",
    api: "API_ENDPOINTS.md",
    environment: "ENVIRONMENT_VARIABLES.md",
    troubleshooting: "TROUBLESHOOTING.md",
    testing: "TESTING.md",
}

export async function generateStaticParams() {
    return Object.keys(slugToFile).map((slug) => ({ slug }))
}

export default async function DocPage({ params }: { params: { slug: string } }) {
    const { slug } = params

    // Verificar si el slug es válido
    if (!Object.keys(slugToFile).includes(slug)) {
        notFound()
    }

    // Obtener el nombre del archivo
    const fileName = slugToFile[slug as keyof typeof slugToFile]

    try {
        // Leer el contenido del archivo markdown
        const filePath = path.join(process.cwd(), "docs", fileName)
        const content = await fs.readFile(filePath, "utf8")

        return <MarkdownRenderer content={content} />
    } catch (error) {
        console.error(`Error al leer el archivo ${fileName}:`, error)
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar la documentación</h2>
                <p>No se pudo cargar el contenido de este documento. Por favor, verifica que el archivo exista.</p>
            </div>
        )
    }
}
