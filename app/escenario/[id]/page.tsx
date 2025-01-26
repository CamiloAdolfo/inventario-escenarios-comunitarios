import { Suspense } from "react"
import EscenarioDetalleClient from "./escenario-detalle-client"
import { supabase } from "@/lib/supabase"

async function getEscenario(id: string) {
  const { data, error } = await supabase.from("escenarios").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

async function getItems(id: string) {
  const { data, error } = await supabase.from("items").select("*").eq("escenario_id", id)
  if (error) throw error
  return data || []
}

export default async function EscenarioPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [escenario, items] = await Promise.all([getEscenario(id), getItems(id)])

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EscenarioDetalleClient escenario={escenario} initialItems={items} id={id} />
    </Suspense>
  )
}

