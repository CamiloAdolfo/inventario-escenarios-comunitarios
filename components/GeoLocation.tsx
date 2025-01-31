"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface GeoLocationProps {
  onLocationSelect: (location: string) => void
  initialValue?: string
}

export function GeoLocation({ onLocationSelect, initialValue = "" }: GeoLocationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getLocation = () => {
    setLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada en este navegador")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const googleMapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`
        onLocationSelect(googleMapsUrl)
        setLoading(false)
      },
      (error) => {
        setError("Error al obtener la ubicación: " + error.message)
        setLoading(false)
      },
    )
  }

  const handleManualInput = (value: string) => {
    // Si el usuario ingresa coordenadas directamente (ej: "3.4516,-76.5320")
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(value)) {
      const googleMapsUrl = `https://maps.google.com/maps?q=${value}`
      onLocationSelect(googleMapsUrl)
    } else {
      // Si es una URL de Google Maps, la usamos directamente
      onLocationSelect(value)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="URL de Google Maps o coordenadas (lat,lng)"
          defaultValue={initialValue}
          onChange={(e) => handleManualInput(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={getLocation}
          disabled={loading}
          className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white"
        >
          {loading ? "Obteniendo..." : "Obtener Ubicación"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

