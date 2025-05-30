import fs from "fs/promises"
import path from "path"
import MarkdownRenderer from "@/components/markdown-renderer"

// Lista de archivos markdown en orden
const markdownFiles = [
    "README.md",
    "OKTA_SETUP.md",
    "ENVIRONMENT_VARIABLES.md",
    "ARCHITECTURE.md",
    "API_ENDPOINTS.md",
    "TROUBLESHOOTING.md",
    "TESTING.md",
]

export default async function AllDocsPage() {
    try {
        // Leer todos los archivos y concatenar su contenido
        let allContent = ""

        for (const fileName of markdownFiles) {
            const filePath = path.join(process.cwd(), "docs", fileName)
            const content = await fs.readFile(filePath, "utf8")
            allContent += `\n\n# ${fileName.replace(".md", "")}\n\n${content}`
        }

        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6">Documentación Completa</h1>
                <div className="prose max-w-none">
                    <MarkdownRenderer content={allContent} />
                </div>
            </div>
        )
    } catch (error) {
        console.error("Error al leer los archivos de documentación:", error)
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar la documentación</h2>
                <p>No se pudo cargar el contenido de los documentos. Por favor, verifica que los archivos existan.</p>
            </div>
        )
    }
}
