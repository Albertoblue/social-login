"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function ExportPage() {
    const [loading, setLoading] = useState(false)

    const exportToPdf = async () => {
        setLoading(true)

        try {
            const doc = new jsPDF("p", "mm", "a4")

            // Obtener todos los documentos
            const docs = [
                { title: "README", id: "readme" },
                { title: "Configuración de Okta", id: "okta-setup" },
                { title: "Variables de Entorno", id: "environment" },
                { title: "Arquitectura", id: "architecture" },
                { title: "API Endpoints", id: "api" },
                { title: "Solución de Problemas", id: "troubleshooting" },
                { title: "Testing", id: "testing" },
            ]

            // Crear portada
            doc.setFontSize(24)
            doc.text("Documentación del Proyecto", 105, 80, { align: "center" })
            doc.setFontSize(16)
            doc.text("Autenticación con OIDC y SAML", 105, 100, { align: "center" })
            doc.setFontSize(12)
            doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 120, { align: "center" })

            // Crear índice
            doc.addPage()
            doc.setFontSize(18)
            doc.text("Índice", 20, 20)

            let y = 40
            docs.forEach((d, i) => {
                doc.setFontSize(12)
                doc.text(`${i + 1}. ${d.title}`, 20, y)
                y += 10
            })

            // Obtener el contenido de cada documento
            for (const docInfo of docs) {
                const element = document.getElementById(docInfo.id)
                if (element) {
                    doc.addPage()
                    doc.setFontSize(18)
                    doc.text(docInfo.title, 20, 20)

                    // Capturar el contenido como imagen
                    const canvas = await html2canvas(element)
                    const imgData = canvas.toDataURL("image/png")

                    // Ajustar la imagen al tamaño de la página
                    const imgProps = doc.getImageProperties(imgData)
                    const pdfWidth = doc.internal.pageSize.getWidth() - 40
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

                    doc.addImage(imgData, "PNG", 20, 30, pdfWidth, pdfHeight)
                }
            }

            // Guardar el PDF
            doc.save("documentacion-proyecto.pdf")
        } catch (error) {
            console.error("Error al exportar a PDF:", error)
            alert("Error al generar el PDF. Por favor, inténtalo de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-4">Exportar Documentación</h1>
                <p className="text-gray-600 mb-6">
                    Exporta toda la documentación en un único archivo PDF para compartir o guardar offline.
                </p>
            </div>

            <div className="p-6 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">Opciones de Exportación</h2>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked disabled className="rounded" />
                            <span>Incluir todos los documentos</span>
                        </label>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked disabled className="rounded" />
                            <span>Incluir diagramas</span>
                        </label>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked disabled className="rounded" />
                            <span>Incluir ejemplos de código</span>
                        </label>
                    </div>
                </div>

                <Button onClick={exportToPdf} disabled={loading} className="mt-6">
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Generando PDF..." : "Descargar PDF"}
                </Button>
            </div>

            <div className="hidden">
                {/* Contenido oculto para exportar */}
                <div id="readme">{/* Contenido del README */}</div>
                <div id="okta-setup">{/* Contenido de la configuración de Okta */}</div>
                {/* Resto de documentos */}
            </div>
        </div>
    )
}
