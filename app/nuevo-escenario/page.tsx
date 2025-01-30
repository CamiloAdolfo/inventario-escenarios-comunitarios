"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { COMUNAS, BARRIOS, ESCENARIOS_DEPORTIVOS } from "../../lib/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AutocompleteInput } from "@/components/AutocompleteInput"

export default function NuevoEscenario() {
  const [formData, setFormData] = useState({
    nombre: "",
    comuna: "",
    susceptible_administracion: "",
    direccion: "",
    barrio: "",
    georeferenciacion: "",
    entidad_administra: "",
    administrador: "",
    celular: "",
    email: "",
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      // Verificar si ya existe un escenario con el mismo nombre
      const { data: existingEscenario } = await supabase
        .from("escenarios")
        .select("id")
        .ilike("nombre", formData.nombre)
        .single()

      if (existingEscenario) {
        // Si existe, redirigir a ese escenario
        router.push(`/escenario/${existingEscenario.id}`)
        return
      }

      // Si no existe, crear nuevo
      const { data, error: supabaseError } = await supabase
        .from("escenarios")
        .insert([{ ...formData, estado: "pendiente" }])
        .select()

      if (supabaseError) throw supabaseError

      router.push("/")
    } catch (error: any) {
      console.error("Error al crear escenario:", error)
      setError(error.message || "Ha ocurrido un error al crear el escenario")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nuevo Escenario</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <AutocompleteInput
          options={ESCENARIOS_DEPORTIVOS}
          value={formData.nombre}
          onChange={(value) => handleChange("nombre", value)}
          placeholder="Nombre del escenario"
          label="Nombre del Escenario"
        />
        <AutocompleteInput
          options={COMUNAS}
          value={formData.comuna}
          onChange={(value) => handleChange("comuna", value)}
          placeholder="Comuna"
          label="Comuna"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Susceptible De Administración</label>
          <RadioGroup
            value={formData.susceptible_administracion}
            onValueChange={(value) => handleChange("susceptible_administracion", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Si" id="susceptible_si" />
              <Label htmlFor="susceptible_si">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="susceptible_no" />
              <Label htmlFor="susceptible_no">No</Label>
            </div>
          </RadioGroup>
        </div>
        <Input
          type="text"
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={(e) => handleChange("direccion", e.target.value)}
          placeholder="Dirección"
          className="mt-1 block w-full"
          required
        />
        <AutocompleteInput
          options={BARRIOS}
          value={formData.barrio}
          onChange={(value) => handleChange("barrio", value)}
          placeholder="Barrio"
          label="Barrio"
        />
        {["georeferenciacion", "entidad_administra", "administrador", "celular", "email"].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
            </label>
            <Input
              type={field === "email" ? "email" : "text"}
              id={field}
              name={field}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => handleChange(field, e.target.value)}
              className="mt-1 block w-full"
              required
            />
          </div>
        ))}

        <Button type="submit" className="w-full">
          Crear Escenario
        </Button>
      </form>
    </div>
  )
}

