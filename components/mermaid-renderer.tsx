"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidProps {
    chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>("")
    const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
        })

        const renderChart = async () => {
            if (ref.current) {
                try {
                    const { svg } = await mermaid.render(id, chart)
                    setSvg(svg)
                } catch (error) {
                    console.error("Error rendering mermaid chart:", error)
                }
            }
        }

        renderChart()
    }, [chart, id])

    return (
        <div className="my-4">
            <div ref={ref} className="mermaid-chart" dangerouslySetInnerHTML={{ __html: svg }} />
            {!svg && (
                <div className="p-4 border rounded bg-gray-50 text-sm">
                    <p>Cargando diagrama...</p>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto">{chart}</pre>
                </div>
            )}
        </div>
    )
}
