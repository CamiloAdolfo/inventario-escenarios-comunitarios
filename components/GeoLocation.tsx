"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"

interface GeoLocationProps {
  onLocationSelect: (location: string) => void
  initialValue?: string
}

export default function GeoLocation({ onLocationSelect, initialValue = "" }: GeoLocationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coordinates, setCoordinates] = useState(initialValue)

  const getLocation = () => {
    setLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const googleMapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`
        setCoordinates(googleMapsUrl)
        onLocationSelect(googleMapsUrl)
        setLoading(false)
      },
      (error) => {
        console.error("Error de geolocalización:", error)
        let errorMessage = "Error al obtener la ubicación"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Debes permitir el acceso a la ubicación en tu navegador"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "La información de ubicación no está disponible"
            break
          case error.TIMEOUT:
            errorMessage = "Se agotó el tiempo para obtener la ubicación"
            break
        }

        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  const handleManualInput = (value: string) => {
    setCoordinates(value)
    onLocationSelect(value)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="URL de Google Maps o coordenadas (lat,lng)"
          value={coordinates}
          onChange={(e) => handleManualInput(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={getLocation}
          disabled={loading}
          className="bg-[#1e2c4f] hover:bg-[#2a3c6f] text-white flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          {loading ? "Obteniendo..." : "Obtener Ubicación"}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

