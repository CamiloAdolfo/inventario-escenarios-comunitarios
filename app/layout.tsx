import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inventario Escenarios Comunitarios",
  description: "Sistema de inventario para escenarios deportivos comunitarios",
  icons: [{ rel: "icon", url: "/icon.svg" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
          <footer className="py-4 text-center text-sm text-gray-500">
            <p>Desarrollado por Camilo Mosquera</p>
          </footer>
        </div>
      </body>
    </html>
  )
}

