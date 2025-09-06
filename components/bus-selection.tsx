"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bus, Clock, MapPin, Users, Loader2, AlertCircle } from "lucide-react"
import { useTransportData } from "@/hooks/use-transport-data"
import type { BusRoute } from "@/lib/transport-api"

interface BusSelectionProps {
  userLocation: { latitude: number; longitude: number } | null
  destination: string
  onBusSelect: (bus: BusRoute) => void
}

export function BusSelection({ userLocation, destination, onBusSelect }: BusSelectionProps) {
  const [availableBuses, setAvailableBuses] = useState<BusRoute[]>([])
  const { loading, error, region, searchBuses } = useTransportData()

  useEffect(() => {
    if (userLocation && destination) {
      console.log("[v0] Fetching buses for location:", userLocation, "destination:", destination)

      searchBuses(userLocation.latitude, userLocation.longitude, destination).then((buses) => {
        setAvailableBuses(buses)
      })
    }
  }, [userLocation, destination, searchBuses])

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCapacityText = (capacity: string) => {
    switch (capacity) {
      case "low":
        return "Pouco cheio"
      case "medium":
        return "Moderado"
      case "high":
        return "Muito cheio"
      default:
        return "Desconhecido"
    }
  }

  const getRegionName = (regionCode: string) => {
    const regions: Record<string, string> = {
      "sao-paulo": "São Paulo",
      "rio-de-janeiro": "Rio de Janeiro",
      global: "Região Geral",
    }
    return regions[regionCode] || regionCode
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Buscando ônibus próximos...</p>
          <p className="text-xs text-muted-foreground mt-1">Consultando APIs de transporte público</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-6 px-2 text-xs bg-transparent"
            onClick={() => {
              if (userLocation) {
                searchBuses(userLocation.latitude, userLocation.longitude, destination).then(setAvailableBuses)
              }
            }}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Region Info */}
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Buscando ônibus em: <strong>{getRegionName(region)}</strong>
          {availableBuses.length > 0 && ` • ${availableBuses.length} linha(s) encontrada(s)`}
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            Ônibus Disponíveis
          </CardTitle>
          <p className="text-sm text-muted-foreground">Escolha o ônibus que você vai pegar</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableBuses.length === 0 ? (
            <div className="text-center py-6">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum ônibus encontrado para este destino</p>
              <p className="text-xs text-muted-foreground mt-1">Tente um destino diferente ou aguarde alguns minutos</p>
            </div>
          ) : (
            availableBuses.map((bus) => (
              <Card key={bus.id} className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 font-bold">
                        {bus.number}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{bus.destination}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {bus.distance}m de distância • {bus.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4 text-secondary" />
                        {bus.eta} min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={`${getCapacityColor(bus.capacity)} flex items-center gap-1`}>
                      <Users className="h-3 w-3" />
                      {getCapacityText(bus.capacity)}
                    </Badge>

                    <Button size="sm" onClick={() => onBusSelect(bus)} className="px-4">
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
