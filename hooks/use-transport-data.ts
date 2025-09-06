"use client"

import { useState } from "react"
import { transportAPI, type BusRoute, type RouteInfo } from "@/lib/transport-api"

export function useTransportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [region, setRegion] = useState<string>("global")

  const searchBuses = async (latitude: number, longitude: number, destination: string): Promise<BusRoute[]> => {
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Searching for buses near:", latitude, longitude, "to:", destination)
      const buses = await transportAPI.searchNearbyBuses(latitude, longitude, destination)
      const detectedRegion = await transportAPI.detectRegion(latitude, longitude)
      setRegion(detectedRegion)
      return buses
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar ônibus"
      setError(errorMessage)
      console.log("[v0] Error searching buses:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getRouteInfo = async (
    busId: string,
    userLocation: { latitude: number; longitude: number },
    destination: string,
  ): Promise<RouteInfo | null> => {
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Getting route info for bus:", busId)
      const routeInfo = await transportAPI.getRouteInfo(busId, userLocation, destination)
      return routeInfo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao obter informações da rota"
      setError(errorMessage)
      console.log("[v0] Error getting route info:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    region,
    searchBuses,
    getRouteInfo,
  }
}
