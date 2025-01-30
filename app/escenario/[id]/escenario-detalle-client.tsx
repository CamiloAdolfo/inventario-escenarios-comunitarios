"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { INMUEBLES, MUEBLES } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Item = {
  id: number
  nombre: string
  cantidad: number
  seccion: string
}

type EscenarioDetalleClientProps = {
  escenario: any
  initialItems: Item[]
  id: string
  estado?: string
}

export default function EscenarioDetalleClient({ escenario, initialItems, id }: EscenarioDetalleClientProps) {
  const [items, setItems] = useState<Item[]>(initialItems || [])
  const [nuevoItem, setNuevoItem] = useState({
    seccion: "",
    nombre: "",
    cantidad: 1,
    esPersonalizado: false,
  })
  const [itemsDisponibles, setItemsDisponibles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleSeccionChange = (seccion: string) => {
    setNuevoItem((prevItem) => ({
      ...prevItem,
      seccion,
      nombre: "",
      esPersonalizado: false,
    }))
    setItemsDisponibles(seccion === "Inmuebles" ? INMUEBLES : MUEBLES)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("items")
        .insert([
          {
            escenario_id: id,
            seccion: nuevoItem.seccion,
            nombre: nuevoItem.nombre,
            cantidad: nuevoItem.cantidad,
          },
        ])
        .select()

      if (supabaseError) {
        throw supabaseError
      }

      if (data) {
        setItems((prevItems) => [...prevItems, ...data])
        setNuevoItem({
          seccion: "",
          nombre: "",
          cantidad: 1,
          esPersonalizado: false,
        })
      }
    } catch (error: any) {
      console.error("Error al agregar item:", error)
      setError(error.message || "Error al agregar el item. Por favor, intenta de nuevo.")
    }
  }

  const handleGuardar = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("escenarios").update({ estado: "completado" }).eq("id", id).select()

      if (error) throw error

      if (data) {
        alert("Inventario guardado exitosamente")
        setIsEditing(false)
      } else {
        throw new Error("No se pudo actualizar el escenario")
      }
    } catch (error: any) {
      console.error("Error al guardar:", error)
      setError(`Error al guardar el inventario: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", itemId)

      if (error) throw error

      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    } catch (error: any) {
      console.error("Error al eliminar item:", error)
      setError(`Error al eliminar el item: ${error.message || "Error desconocido"}`)
    }
  }

  if (!escenario) {
    return <div>Cargando...</div>
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{escenario.nombre}</h1>
        <div className="space-x-2">
          <Button className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancelar Edición" : "Editar"}
          </Button>
          <Button className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white" onClick={() => router.push("/")}>
            Volver
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">Información del Escenario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Nombre:</span>
                  <span>{escenario.nombre}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Susceptible administracion:</span>
                  <span>{escenario.susceptible_administracion}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Barrio:</span>
                  <span>{escenario.barrio}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Entidad administra:</span>
                  <span>{escenario.entidad_administra}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Celular:</span>
                  <span>{escenario.celular}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Comuna:</span>
                  <span>{escenario.comuna}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Direccion:</span>
                  <span>{escenario.direccion}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Georeferenciacion:</span>
                  <span>{escenario.georeferenciacion}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Administrador:</span>
                  <span>{escenario.administrador}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] gap-2">
                  <span className="font-semibold">Email:</span>
                  <span>{escenario.email}</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {isEditing && (
          <section>
            <h2 className="text-xl font-bold mb-4">Agregar Item</h2>
            <Card className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,120px,auto] gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sección</label>
                    <Select value={nuevoItem.seccion} onValueChange={handleSeccionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione sección" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inmuebles">Inmuebles</SelectItem>
                        <SelectItem value="Muebles">Muebles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {nuevoItem.seccion && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Item</label>
                        {nuevoItem.esPersonalizado ? (
                          <Input
                            type="text"
                            value={nuevoItem.nombre}
                            onChange={(e) => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
                            placeholder="Nombre del nuevo item"
                          />
                        ) : (
                          <Select
                            value={nuevoItem.nombre}
                            onValueChange={(value) => setNuevoItem({ ...nuevoItem, nombre: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione item" />
                            </SelectTrigger>
                            <SelectContent>
                              {itemsDisponibles.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <Input
                          type="number"
                          min="1"
                          value={nuevoItem.cantidad}
                          onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: Number.parseInt(e.target.value) })}
                        />
                      </div>

                      <Button type="submit" className="bg-[#1e2c4f] hover:bg-[#2a3c6f]">
                        Agregar Item
                      </Button>
                    </>
                  )}
                </div>

                {nuevoItem.seccion && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="esPersonalizado"
                      checked={nuevoItem.esPersonalizado}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, esPersonalizado: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="esPersonalizado" className="text-sm">
                      Agregar item personalizado
                    </label>
                  </div>
                )}
              </form>
            </Card>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">Inmuebles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items
              .filter((item) => item.seccion === "Inmuebles")
              .map((item) => (
                <Card key={`inmueble-${item.id}`} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    {isEditing && (
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                        Eliminar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Muebles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items
              .filter((item) => item.seccion === "Muebles")
              .map((item) => (
                <Card key={`mueble-${item.id}`} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    {isEditing && (
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                        Eliminar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </section>

        {isEditing && (
          <div className="flex justify-end mt-8">
            <Button size="lg" onClick={handleGuardar} disabled={loading} className="bg-[#1e2c4f] hover:bg-[#2a3c6f]">
              {loading ? "Guardando..." : "Guardar Inventario"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
        )}
      </div>
    </div>
  )
}

