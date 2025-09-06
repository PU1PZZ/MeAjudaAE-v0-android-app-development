"use client"

export interface TransportProvider {
  id: string
  name: string
  regions: string[]
  apiKey?: string
}

export interface BusRoute {
  id: string
  number: string
  destination: string
  eta: number
  capacity: "low" | "medium" | "high"
  distance: number
  provider: string
}

export interface BusStop {
  id: string
  name: string
  latitude: number
  longitude: number
  distance: number
  isDestination: boolean
  passed: boolean
}

export interface RouteInfo {
  stops: BusStop[]
  totalDistance: number
  estimatedTime: number
  provider: string
}

// Transport providers configuration
const TRANSPORT_PROVIDERS: TransportProvider[] = [
  {
    id: "google-transit",
    name: "Google Maps Transit",
    regions: ["global"],
  },
  {
    id: "sptrans",
    name: "SPTrans (São Paulo)",
    regions: ["sao-paulo", "sp"],
  },
  {
    id: "rio-transit",
    name: "Rio de Janeiro Transit",
    regions: ["rio-de-janeiro", "rj"],
  },
]

class TransportAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("[v0] Using cached data for:", key)
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async detectRegion(latitude: number, longitude: number): Promise<string> {
    const cacheKey = `region-${latitude.toFixed(3)}-${longitude.toFixed(3)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Use reverse geocoding to detect city/region
      // For demo purposes, we'll simulate based on coordinates
      let region = "global"

      // São Paulo region (approximate bounds)
      if (latitude >= -24.0 && latitude <= -23.0 && longitude >= -47.0 && longitude <= -46.0) {
        region = "sao-paulo"
      }
      // Rio de Janeiro region (approximate bounds)
      else if (latitude >= -23.5 && latitude <= -22.5 && longitude >= -44.0 && longitude <= -43.0) {
        region = "rio-de-janeiro"
      }

      console.log("[v0] Detected region:", region, "for coordinates:", latitude, longitude)
      this.setCachedData(cacheKey, region)
      return region
    } catch (error) {
      console.log("[v0] Error detecting region:", error)
      return "global"
    }
  }

  async searchNearbyBuses(latitude: number, longitude: number, destination: string): Promise<BusRoute[]> {
    const cacheKey = `buses-${latitude.toFixed(3)}-${longitude.toFixed(3)}-${destination}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const region = await this.detectRegion(latitude, longitude)
      const provider = TRANSPORT_PROVIDERS.find((p) => p.regions.includes(region)) || TRANSPORT_PROVIDERS[0]

      console.log("[v0] Searching buses with provider:", provider.name, "in region:", region)

      // Simulate API call with realistic data based on region
      const mockBuses = this.generateMockBuses(region, destination)

      this.setCachedData(cacheKey, mockBuses)
      return mockBuses
    } catch (error) {
      console.log("[v0] Error searching buses:", error)
      return this.generateMockBuses("global", destination)
    }
  }

  async getRouteInfo(
    busId: string,
    userLocation: { latitude: number; longitude: number },
    destination: string,
  ): Promise<RouteInfo> {
    const cacheKey = `route-${busId}-${destination}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const region = await this.detectRegion(userLocation.latitude, userLocation.longitude)
      console.log("[v0] Getting route info for bus:", busId, "in region:", region)

      // Generate realistic route based on region and destination
      const routeInfo = this.generateMockRoute(region, destination, userLocation)

      this.setCachedData(cacheKey, routeInfo)
      return routeInfo
    } catch (error) {
      console.log("[v0] Error getting route info:", error)
      return this.generateMockRoute("global", destination, userLocation)
    }
  }

  private generateMockBuses(region: string, destination: string): BusRoute[] {
    const buses: BusRoute[] = []
    const busNumbers = this.getBusNumbersForRegion(region)

    busNumbers.forEach((number, index) => {
      buses.push({
        id: `bus-${number}-${index}`,
        number,
        destination: this.generateDestination(region, destination),
        eta: Math.floor(Math.random() * 15) + 3, // 3-18 minutes
        capacity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
        distance: Math.floor(Math.random() * 500) + 100, // 100-600 meters
        provider: region,
      })
    })

    return buses.sort((a, b) => a.eta - b.eta)
  }

  private generateMockRoute(
    region: string,
    destination: string,
    userLocation: { latitude: number; longitude: number },
  ): RouteInfo {
    const stops: BusStop[] = []
    const stopNames = this.getStopNamesForRegion(region)

    stopNames.forEach((name, index) => {
      stops.push({
        id: `stop-${index}`,
        name: index === 0 ? "Ponto Atual" : index === stopNames.length - 2 ? destination : name,
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.01,
        distance: index * 0.8 + Math.random() * 0.3,
        isDestination: index === stopNames.length - 2,
        passed: false,
      })
    })

    return {
      stops,
      totalDistance: stops[stops.length - 1]?.distance || 0,
      estimatedTime: stops.length * 3,
      provider: region,
    }
  }

  private getBusNumbersForRegion(region: string): string[] {
    switch (region) {
      case "sao-paulo":
        return ["175", "702", "856", "477", "309", "675"]
      case "rio-de-janeiro":
        return ["474", "583", "638", "415", "392", "511"]
      default:
        return ["101", "205", "348", "567", "789", "432"]
    }
  }

  private getStopNamesForRegion(region: string): string[] {
    switch (region) {
      case "sao-paulo":
        return [
          "Ponto Atual",
          "Av. Paulista, 1000",
          "Rua Augusta, 500",
          "Praça da República",
          "Estação da Sé",
          "Terminal Bandeira",
        ]
      case "rio-de-janeiro":
        return [
          "Ponto Atual",
          "Av. Copacabana, 200",
          "Praça General Osório",
          "Estação Cardeal Arcoverde",
          "Centro da Cidade",
          "Terminal Alvorada",
        ]
      default:
        return [
          "Ponto Atual",
          "Avenida Principal, 100",
          "Centro Comercial",
          "Praça Central",
          "Estação Central",
          "Terminal Rodoviário",
        ]
    }
  }

  private generateDestination(region: string, userDestination: string): string {
    const destinations = {
      "sao-paulo": ["Terminal Bandeira", "Estação da Sé", "Shopping Ibirapuera", "Aeroporto de Congonhas"],
      "rio-de-janeiro": ["Terminal Alvorada", "Centro", "Aeroporto Santos Dumont", "Barra da Tijuca"],
      global: ["Centro", "Terminal Rodoviário", "Aeroporto", "Shopping Center"],
    }

    const regionDestinations = destinations[region as keyof typeof destinations] || destinations.global
    return regionDestinations[Math.floor(Math.random() * regionDestinations.length)]
  }
}

export const transportAPI = new TransportAPI()
