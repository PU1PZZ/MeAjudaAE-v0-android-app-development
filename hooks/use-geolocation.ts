"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalização não é suportada neste navegador",
        loading: false,
      }))
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("[v0] Location updated:", position.coords)
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        })
      },
      (error) => {
        console.log("[v0] Geolocation error:", error.message)
        let errorMessage = "Erro ao obter localização"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível"
            break
          case error.TIMEOUT:
            errorMessage = "Tempo limite para obter localização"
            break
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const requestLocation = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
  }

  return { ...state, requestLocation }
}
