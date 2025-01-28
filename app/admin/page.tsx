import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Item {
  id: number
  nombre: string
  cantidad: number
  seccion: string
}

interface Escenario {
  id: string
  nombre: string
  comuna: string
  direccion: string
  barrio: string
  administrador: string
  items: Item[]
}

export default async function AdminPage() {
  const { data: escenarios, error } = await supabase.from("escenarios").select(`
      *,
      items (
        id,
        nombre,
        cantidad,
        seccion
      )
    `)

  if (error) {
    console.error("Error fetching data:", error)
    return <div>Error cargando los datos</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1>

      <div className="grid gap-6">
        {escenarios?.map((escenario: Escenario) => (
          <div key={escenario.id} className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">{escenario.nombre}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-2">Información General</h3>
                <div className="grid gap-2 text-sm">
                  <p>
                    <strong>Comuna:</strong> {escenario.comuna}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {escenario.direccion}
                  </p>
                  <p>
                    <strong>Barrio:</strong> {escenario.barrio}
                  </p>
                  <p>
                    <strong>Administrador:</strong> {escenario.administrador}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Inventario</h3>
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Inmuebles</h4>
                    <div className="text-sm">
                      {escenario.items
                        ?.filter((item: Item) => item.seccion === "Inmuebles")
                        .map((item: Item) => (
                          <p key={item.id}>
                            {item.nombre}: {item.cantidad}
                          </p>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Muebles</h4>
                    <div className="text-sm">
                      {escenario.items
                        ?.filter((item: Item) => item.seccion === "Muebles")
                        .map((item: Item) => (
                          <p key={item.id}>
                            {item.nombre}: {item.cantidad}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href={`/escenario/${escenario.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver detalles →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

