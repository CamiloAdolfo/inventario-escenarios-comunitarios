"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [escenarios, setEscenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEscenarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("escenarios").select("*").order("id", { ascending: false })

      if (error) throw error

      setEscenarios(data || [])
    } catch (error) {
      console.error("Error fetching escenarios:", error)
      setError("Error al cargar los escenarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEscenarios()
  }, [])

  // Modificamos la función de filtrado para que sea case-insensitive y busque en más campos
  const filteredEscenarios = escenarios.filter((escenario) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      escenario.nombre?.toLowerCase().includes(searchTermLower) ||
      escenario.comuna?.toLowerCase().includes(searchTermLower) ||
      escenario.barrio?.toLowerCase().includes(searchTermLower) ||
      escenario.direccion?.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Inventario Escenarios Comunitarios</h1>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Escenarios Deportivos</h2>
        <Link href="/nuevo-escenario">
          <Button>Nuevo Escenario</Button>
        </Link>
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Buscar por nombre, comuna, barrio o dirección..."
          className="max-w-md w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">Cargando escenarios...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : filteredEscenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEscenarios.map((escenario) => (
            <Link
              href={`/escenario/${escenario.id}`}
              key={escenario.id}
              className="block border p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{escenario.nombre}</h2>
              <div className="text-sm text-gray-600">
                <p>Comuna: {escenario.comuna}</p>
                <p>Dirección: {escenario.direccion}</p>
                <p>Barrio: {escenario.barrio}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No se encontraron escenarios</div>
      )}
    </div>
  )
}

