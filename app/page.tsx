"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, Clock, Bus, Loader2, AlertCircle } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { BusSelection } from "@/components/bus-selection"
import { RouteTracking } from "@/components/route-tracking"

export default function HomePage() {
  const [destination, setDestination] = useState("")
  const [showBusSelection, setShowBusSelection] = useState(false)
  const [selectedBus, setSelectedBus] = useState<any>(null)
  const [showRouteTracking, setShowRouteTracking] = useState(false)
  const [recentDestinations] = useState([
    "Shopping Center Norte",
    "Estação da Sé",
    "Aeroporto de Congonhas",
    "Universidade de São Paulo",
  ])

  const {
    latitude,
    longitude,
    accuracy,
    error: locationError,
    loading: locationLoading,
    requestLocation,
  } = useGeolocation()

  const handleSearch = () => {
    if (destination.trim()) {
      console.log("[v0] Searching for destination:", destination)
      if (latitude && longitude) {
        setShowBusSelection(true)
      } else {
        requestLocation()
      }
    }
  }

  const handleRecentDestination = (dest: string) => {
    setDestination(dest)
    console.log("[v0] Selected recent destination:", dest)
  }

  const handleBusSelect = (bus: any) => {
    setSelectedBus(bus)
    setShowBusSelection(false)
    setShowRouteTracking(true)
    console.log("[v0] Selected bus:", bus, "Starting route tracking")
  }

  const handleBackToHome = () => {
    setShowRouteTracking(false)
    setShowBusSelection(false)
    setSelectedBus(null)
    setDestination("")
  }

  const handleBackToBusSelection = () => {
    setShowRouteTracking(false)
    setShowBusSelection(true)
  }

  const handleLocationRequest = () => {
    requestLocation()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Bus className="h-6 w-6" />
            BusAlert
          </h1>
          <p className="text-sm text-center mt-1 opacity-90">Nunca perca sua parada novamente</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Route Tracking Screen */}
        {showRouteTracking && selectedBus && latitude && longitude && (
          <RouteTracking
            selectedBus={selectedBus}
            destination={destination}
            userLocation={{ latitude, longitude }}
            onBack={handleBackToBusSelection}
          />
        )}

        {/* Bus Selection Screen */}
        {showBusSelection && !showRouteTracking && latitude && longitude && (
          <BusSelection
            userLocation={{ latitude, longitude }}
            destination={destination}
            onBusSelect={handleBusSelect}
          />
        )}

        {/* Home Screen */}
        {!showBusSelection && !showRouteTracking && (
          <>
            {/* Location Status */}
            {locationError && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {locationError}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-6 px-2 text-xs bg-transparent"
                    onClick={handleLocationRequest}
                  >
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {locationLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Obtendo sua localização...</AlertDescription>
              </Alert>
            )}

            {latitude && longitude && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Localização obtida com precisão de {accuracy ? Math.round(accuracy) : "N/A"}m
                </AlertDescription>
              </Alert>
            )}

            {/* Destination Search */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Para onde você vai?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu destino..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} className="px-6" disabled={!destination.trim()}>
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Destinations */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Destinos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {recentDestinations.map((dest, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => handleRecentDestination(dest)}
                    >
                      <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{dest}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Bus className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Ônibus Próximos</p>
                  <p className="text-xs text-muted-foreground">Ver linhas na região</p>
                </CardContent>
              </Card>

              <Card
                className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={handleLocationRequest}
              >
                <CardContent className="p-4 text-center">
                  {locationLoading ? (
                    <Loader2 className="h-8 w-8 text-secondary mx-auto mb-2 animate-spin" />
                  ) : (
                    <Navigation className="h-8 w-8 text-secondary mx-auto mb-2" />
                  )}
                  <p className="text-sm font-medium">Minha Localização</p>
                  <p className="text-xs text-muted-foreground">
                    {latitude && longitude ? "Localização ativa" : "Usar GPS atual"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Toque em um destino recente ou digite um novo endereço</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
