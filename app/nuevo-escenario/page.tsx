"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { COMUNAS, BARRIOS, ESCENARIOS_DEPORTIVOS } from "../../lib/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AutocompleteInput } from "@/components/AutocompleteInput"
import GeoLocation from "@/components/GeoLocation"

export default function NuevoEscenario() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    comuna: "",
    barrio: "",
    susceptible_administracion: "",
    georeferenciacion: "",
    entidad_administra: "",
    administrador: "",
    celular: "",
    email: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from("escenarios").insert([formData])

      if (error) throw error

      router.push("/")
    } catch (error) {
      console.error("Error al crear el escenario:", error)
      alert("Error al crear el escenario. Por favor, intenta de nuevo.")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nuevo Escenario</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Escenario</Label>
            <AutocompleteInput
              options={ESCENARIOS_DEPORTIVOS}
              value={formData.nombre}
              onChange={(value) => handleChange("nombre", value)}
              placeholder="Nombre del escenario"
              label="nombre"
            />
          </div>

          <div>
            <Label htmlFor="comuna">Comuna</Label>
            <AutocompleteInput
              options={COMUNAS}
              value={formData.comuna}
              onChange={(value) => handleChange("comuna", value)}
              placeholder="Selecciona una comuna"
              label="comuna"
            />
          </div>

          <div>
            <Label>Susceptible De Administración</Label>
            <RadioGroup
              value={formData.susceptible_administracion}
              onValueChange={(value) => handleChange("susceptible_administracion", value)}
              className="flex items-center space-x-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Si" id="si" />
                <Label htmlFor="si">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Dirección del escenario"
            />
          </div>

          <div>
            <Label htmlFor="barrio">Barrio</Label>
            <AutocompleteInput
              options={BARRIOS}
              value={formData.barrio}
              onChange={(value) => handleChange("barrio", value)}
              placeholder="Selecciona un barrio"
              label="barrio"
            />
          </div>

          <div>
            <Label>Georeferenciación</Label>
            <GeoLocation
              initialValue={formData.georeferenciacion}
              onLocationSelect={(location) => handleChange("georeferenciacion", location)}
            />
          </div>

          <div>
            <Label htmlFor="entidad_administra">Entidad administra</Label>
            <Input
              id="entidad_administra"
              value={formData.entidad_administra}
              onChange={(e) => handleChange("entidad_administra", e.target.value)}
              placeholder="Entidad que administra"
            />
          </div>

          <div>
            <Label htmlFor="administrador">Administrador</Label>
            <Input
              id="administrador"
              value={formData.administrador}
              onChange={(e) => handleChange("administrador", e.target.value)}
              placeholder="Nombre del administrador"
            />
          </div>

          <div>
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => handleChange("celular", e.target.value)}
              placeholder="Número de celular"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email de contacto"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.push("/")}>
            Cancelar
          </Button>
          <Button type="submit">Crear Escenario</Button>
        </div>
      </form>
    </div>
  )
}

