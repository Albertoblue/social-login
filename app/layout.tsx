import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { OidcProvider } from "@/components/oidc-provider"

export const metadata: Metadata = {
  title: "Multi-Auth App",
  description: "App with multiple authentication providers",
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
      <body>
      <OidcProvider>{children}</OidcProvider>
      </body>
      </html>
  )
}
