"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, initializeDatabase } from "@/lib/supabase"
import { getItemsDisponibles } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import GeoLocation from "@/components/GeoLocation"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { InventoryActDownload } from "@/components/InventoryActDownload"

type Item = {
  id: number
  nombre: string
  cantidad: number
  seccion: string
  estado: string
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
    estado: "",
    esPersonalizado: false,
  })
  const [itemsDisponibles, setItemsDisponibles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [escenarioState, setEscenario] = useState(escenario)
  const router = useRouter()
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  useEffect(() => {
    initializeDatabase()
  }, [])

  const actualizarItemsDisponibles = async (seccion: string) => {
    try {
      const items = await getItemsDisponibles(seccion)
      setItemsDisponibles(items)
    } catch (error) {
      console.error("Error al cargar items disponibles:", error)
    }
  }

  const handleSeccionChange = async (seccion: string) => {
    setNuevoItem((prevItem) => ({
      ...prevItem,
      seccion,
      nombre: "",
      esPersonalizado: false,
      estado: "",
    }))
    await actualizarItemsDisponibles(seccion)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación de campos requeridos
    if (!nuevoItem.nombre || !nuevoItem.cantidad || !nuevoItem.estado || !nuevoItem.seccion) {
      setError("Todos los campos son obligatorios: nombre, cantidad y estado")
      return
    }

    setLoading(true)

    try {
      if (nuevoItem.esPersonalizado) {
        const { data: existingItem, error: checkError } = await supabase
          .from("items_disponibles")
          .select()
          .eq("nombre", nuevoItem.nombre)
          .eq("seccion", nuevoItem.seccion)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error al verificar item existente:", checkError)
          throw checkError
        }

        if (!existingItem) {
          const { data: newItem, error: insertError } = await supabase
            .from("items_disponibles")
            .insert([
              {
                nombre: nuevoItem.nombre,
                seccion: nuevoItem.seccion,
              },
            ])
            .select()
            .single()

          if (insertError) {
            console.error("Error al insertar item personalizado:", insertError)
            throw insertError
          }

          console.log("Item personalizado insertado:", newItem)
        } else {
          console.log("Item personalizado ya existe:", existingItem)
        }

        await actualizarItemsDisponibles(nuevoItem.seccion)
      }

      const { data: newItemData, error: itemError } = await supabase
        .from("items")
        .insert([
          {
            escenario_id: id,
            seccion: nuevoItem.seccion,
            nombre: nuevoItem.nombre,
            cantidad: nuevoItem.cantidad,
            estado: nuevoItem.estado,
          },
        ])
        .select()

      if (itemError) {
        console.error("Error al insertar item en la tabla items:", itemError)
        throw itemError
      }

      if (newItemData) {
        console.log("Nuevo item agregado:", newItemData)
        setItems((prevItems) => [...prevItems, ...newItemData])
        setNuevoItem({
          seccion: nuevoItem.seccion,
          nombre: "",
          cantidad: 1,
          estado: "",
          esPersonalizado: false,
        })

        setItemsDisponibles((prevItems) => Array.from(new Set([...prevItems, nuevoItem.nombre])))
      }
    } catch (error: any) {
      console.error("Error al agregar item:", error)
      setError(error.message || "Error al agregar el item. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("escenarios").update({ estado: "completado" }).eq("id", id).select()

      if (error) throw error

      if (data) {
        setShowDownloadDialog(true)
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

  const handleSaveInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from("escenarios").update(escenarioState).eq("id", id).select()

      if (error) throw error

      if (data) {
        setEscenario(data[0])
        setIsEditingInfo(false)
        alert("Información del escenario actualizada exitosamente")
      }
    } catch (error: any) {
      console.error("Error al actualizar la información del escenario:", error)
      setError(`Error al actualizar la información: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Información del Escenario</h2>
            <Button
              className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white"
              onClick={() => setIsEditingInfo(!isEditingInfo)}
            >
              {isEditingInfo ? "Cancelar" : "Editar Escenario"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                {isEditingInfo ? (
                  <>
                    <Input
                      value={escenarioState.nombre}
                      onChange={(e) => setEscenario({ ...escenarioState, nombre: e.target.value })}
                      placeholder="Nombre"
                    />
                    <Input
                      value={escenarioState.susceptible_administracion}
                      onChange={(e) => setEscenario({ ...escenarioState, susceptible_administracion: e.target.value })}
                      placeholder="Susceptible administración"
                    />
                    <Input
                      value={escenarioState.barrio}
                      onChange={(e) => setEscenario({ ...escenarioState, barrio: e.target.value })}
                      placeholder="Barrio"
                    />
                    <Input
                      value={escenarioState.entidad_administra}
                      onChange={(e) => setEscenario({ ...escenarioState, entidad_administra: e.target.value })}
                      placeholder="Entidad administra"
                    />
                    <Input
                      value={escenarioState.celular}
                      onChange={(e) => setEscenario({ ...escenarioState, celular: e.target.value })}
                      placeholder="Celular"
                    />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Nombre:</span>
                      <span>{escenarioState.nombre}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Susceptible administracion:</span>
                      <span>{escenarioState.susceptible_administracion}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Barrio:</span>
                      <span>{escenarioState.barrio}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Entidad administra:</span>
                      <span>{escenarioState.entidad_administra}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Celular:</span>
                      <span>{escenarioState.celular}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                {isEditingInfo ? (
                  <>
                    <Input
                      value={escenarioState.comuna}
                      onChange={(e) => setEscenario({ ...escenarioState, comuna: e.target.value })}
                      placeholder="Comuna"
                    />
                    <Input
                      value={escenarioState.direccion}
                      onChange={(e) => setEscenario({ ...escenarioState, direccion: e.target.value })}
                      placeholder="Dirección"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">Georeferenciación</label>
                      <GeoLocation
                        initialValue={escenarioState.georeferenciacion}
                        onLocationSelect={(location) =>
                          setEscenario({ ...escenarioState, georeferenciacion: location })
                        }
                      />
                    </div>
                    <Input
                      value={escenarioState.administrador}
                      onChange={(e) => setEscenario({ ...escenarioState, administrador: e.target.value })}
                      placeholder="Administrador"
                    />
                    <Input
                      value={escenarioState.email}
                      onChange={(e) => setEscenario({ ...escenarioState, email: e.target.value })}
                      placeholder="Email"
                    />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Comuna:</span>
                      <span>{escenarioState.comuna}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Direccion:</span>
                      <span>{escenarioState.direccion}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Georeferenciacion:</span>
                      <span>{escenarioState.georeferenciacion}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Administrador:</span>
                      <span>{escenarioState.administrador}</span>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <span className="font-semibold">Email:</span>
                      <span>{escenarioState.email}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
          {isEditingInfo && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveInfo} className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white">
                Guardar Cambios
              </Button>
            </div>
          )}
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
                              {itemsDisponibles.length > 0 ? (
                                itemsDisponibles.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no_items" disabled>
                                  No hay items disponibles
                                </SelectItem>
                              )}
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
                      <div>
                        <label className="block text-sm font-medium mb-1">Estado</label>
                        <Select
                          value={nuevoItem.estado}
                          onValueChange={(value) => setNuevoItem({ ...nuevoItem, estado: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bueno">Bueno</SelectItem>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Malo">Malo</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <p className="text-sm text-gray-600">Estado: {item.estado}</p>
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
                      <p className="text-sm text-gray-600">Estado: {item.estado}</p>
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
      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inventario guardado exitosamente</AlertDialogTitle>
            <AlertDialogDescription>¿Desea descargar el acta del inventario?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction asChild>
              <InventoryActDownload
                escenario={escenarioState}
                items={items}
                templateUrl="/plantilla_acta_inventario.docx"
              />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

