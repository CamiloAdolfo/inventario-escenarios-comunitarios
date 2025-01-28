import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import EscenarioDetalleClient from "./escenario-detalle-client"

export const revalidate = 60 // Revalidar cada minuto

async function getEscenario(id: string) {
  const { data: escenario, error: errorEscenario } = await supabase.from("escenarios").select("*").eq("id", id).single()

  if (errorEscenario) {
    console.error("Error fetching escenario:", errorEscenario)
    return null
  }

  return escenario
}

async function getItems(id: string) {
  const { data: items, error: errorItems } = await supabase.from("items").select("*").eq("escenario_id", id)

  if (errorItems) {
    console.error("Error fetching items:", errorItems)
    return []
  }

  return items || []
}

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const escenario = await getEscenario(params.id)
  return {
    title: escenario ? `Escenario: ${escenario.nombre}` : "Escenario no encontrado",
  }
}

export default async function Page({ params }: Props) {
  const escenario = await getEscenario(params.id)
  const initialItems = await getItems(params.id)

  if (!escenario) {
    return <div className="p-4 text-red-500">Escenario no encontrado</div>
  }

  return <EscenarioDetalleClient escenario={escenario} initialItems={initialItems} id={params.id} />
}

