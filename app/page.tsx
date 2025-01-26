import Link from "next/link"
import { supabase } from "../lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function Home() {
  const { data: escenarios, error } = await supabase.from("escenarios").select("*")

  if (error) {
    console.error("Error fetching escenarios:", error)
  }

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
        <Input type="search" placeholder="Buscar escenario..." className="max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {escenarios?.map((escenario) => (
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
    </div>
  )
}

