import type React from "react"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">{children}</main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>Desarrollado con ❤️ por Camilo Mosquera</p>
      </footer>
    </div>
  )
}

