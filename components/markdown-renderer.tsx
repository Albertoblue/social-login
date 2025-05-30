"use client"

import type React from "react"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import Mermaid from "./mermaid-renderer"
import type { Components } from "react-markdown"
import type { Element } from "hast"

interface MarkdownRendererProps {
    content: string
}

interface CodeProps {
    node?: Element
    inline?: boolean
    className?: string
    children?: React.ReactNode
    [key: string]: any
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="animate-pulse bg-gray-100 h-96 w-full rounded"></div>
    }

    const components: Components = {
        code({ node, inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""

            if (language === "mermaid") {
                return <Mermaid chart={String(children).replace(/\n$/, "")} />
            }

            return !inline ? (
                (SyntaxHighlighter as any)({
                    style: vscDarkPlus,
                    language: language,
                    PreTag: "div",
                    children: String(children).replace(/\n$/, ""),
                })
            ) : (
                <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm`} {...props}>
                    {children}
                </code>
            )
        },
        // Estilos mejorados para elementos Markdown
        h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 border-b border-gray-100 pb-1">{children}</h2>
        ),
        h3: ({ children }) => <h3 className="text-xl font-medium mt-4 mb-2 text-gray-700">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-medium mt-3 mb-2 text-gray-700">{children}</h4>,
        p: ({ children }) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-600 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-600 ml-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic rounded-r">
                {children}
            </blockquote>
        ),
        table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">{children}</table>
            </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
        tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
        th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
        ),
        td: ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>,
        a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
        hr: () => <hr className="my-8 border-gray-300" />,
    }

    return (
        <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
