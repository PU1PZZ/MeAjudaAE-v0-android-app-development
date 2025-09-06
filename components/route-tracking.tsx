"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bus,
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Users,
  Settings,
  Loader2,
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useAudioAlerts } from "@/hooks/use-audio-alerts"
import { useTransportData } from "@/hooks/use-transport-data"
import { AlertSettingsComponent } from "@/components/alert-settings"
import type { BusRoute, BusStop, RouteInfo } from "@/lib/transport-api"

interface AlertSettings {
  notifications: boolean
  sound: boolean
  vibration: boolean
  alertDistance: number
}

interface RouteTrackingProps {
  selectedBus: BusRoute
  destination: string
  userLocation: { latitude: number; longitude: number }
  onBack: () => void
}

export function RouteTracking({ selectedBus, destination, userLocation, onBack }: RouteTrackingProps) {
  const [currentStop, setCurrentStop] = useState(0)
  const [timeToDestination, setTimeToDestination] = useState(15)
  const [stopsToDestination, setStopsToDestination] = useState(5)
  const [isNearDestination, setIsNearDestination] = useState(false)
  const [hasAlerted, setHasAlerted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [busStops, setBusStops] = useState<BusStop[]>([])

  const { showNotification } = useNotifications()
  const { playDestinationAlert, vibrate } = useAudioAlerts()
  const { loading, error, getRouteInfo } = useTransportData()
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    notifications: true,
    sound: true,
    vibration: true,
    alertDistance: 2,
  })

  // Load route information
  useEffect(() => {
    console.log("[v0] Loading route info for bus:", selectedBus.id)
    getRouteInfo(selectedBus.id, userLocation, destination).then((info) => {
      if (info) {
        setRouteInfo(info)
        setBusStops(info.stops)
        setTimeToDestination(info.estimatedTime)

        const destinationIndex = info.stops.findIndex((stop) => stop.isDestination)
        setStopsToDestination(Math.max(0, destinationIndex))
      }
    })
  }, [selectedBus.id, userLocation, destination, getRouteInfo])

  // Trigger alerts when near destination
  useEffect(() => {
    if (stopsToDestination <= alertSettings.alertDistance && stopsToDestination > 0 && !hasAlerted) {
      console.log("[v0] Triggering destination alert - stops remaining:", stopsToDestination)

      // Show notification
      if (alertSettings.notifications) {
        showNotification({
          title: "BusAlert - Prepare-se para descer!",
          body: `Faltam ${stopsToDestination} parada(s) para ${destination}`,
          tag: "destination-alert",
          requireInteraction: true,
        })
      }

      // Play sound
      if (alertSettings.sound) {
        playDestinationAlert()
      }

      // Vibrate
      if (alertSettings.vibration) {
        vibrate([300, 100, 300, 100, 300])
      }

      setHasAlerted(true)
      setIsNearDestination(true)
    }
  }, [stopsToDestination, alertSettings, hasAlerted, destination, showNotification, playDestinationAlert, vibrate])

  // Simulate bus movement
  useEffect(() => {
    if (busStops.length === 0) return

    const interval = setInterval(() => {
      setCurrentStop((prev) => {
        const next = prev + 1
        if (next >= busStops.length) return prev

        // Update time and stops remaining
        const destinationIndex = busStops.findIndex((stop) => stop.isDestination)
        const stopsRemaining = Math.max(0, destinationIndex - next)

        setStopsToDestination(stopsRemaining)
        setTimeToDestination(Math.max(1, stopsRemaining * 3))

        // Reset alert flag when moving away from destination
        if (stopsRemaining > alertSettings.alertDistance) {
          setHasAlerted(false)
          setIsNearDestination(false)
        }

        console.log("[v0] Bus moved to stop:", next, "Stops to destination:", stopsRemaining)

        return next
      })
    }, 8000) // Move every 8 seconds for demo

    return () => clearInterval(interval)
  }, [busStops, alertSettings.alertDistance])

  const routeProgress = busStops.length > 0 ? ((currentStop + 1) / busStops.length) * 100 : 0

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando informações da rota...</p>
          <p className="text-xs text-muted-foreground mt-1">Consultando APIs de transporte público</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar rota: {error}
          <Button variant="outline" size="sm" className="ml-2 h-6 px-2 text-xs bg-transparent" onClick={onBack}>
            Voltar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (showSettings) {
    return (
      <AlertSettingsComponent
        settings={alertSettings}
        onSettingsChange={setAlertSettings}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with back button and settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">Ônibus {selectedBus.number}</h2>
            <p className="text-sm text-muted-foreground">{selectedBus.destination}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* API Info */}
      {routeInfo && (
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            Dados em tempo real • Provedor: <strong>{routeInfo.provider}</strong>
            {routeInfo.totalDistance > 0 && ` • ${routeInfo.totalDistance.toFixed(1)}km total`}
          </AlertDescription>
        </Alert>
      )}

      {/* Destination Alert */}
      {isNearDestination && (
        <Card className="border-secondary bg-secondary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-secondary animate-pulse" />
              <div>
                <p className="font-medium text-secondary">Prepare-se para descer!</p>
                <p className="text-sm text-muted-foreground">
                  {stopsToDestination === 1
                    ? "Próxima parada é seu destino"
                    : `${stopsToDestination} paradas restantes`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Status */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Status da Viagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-secondary">
                <Clock className="h-6 w-6" />
                {timeToDestination}min
              </div>
              <p className="text-sm text-muted-foreground">Tempo estimado</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                <MapPin className="h-6 w-6" />
                {stopsToDestination}
              </div>
              <p className="text-sm text-muted-foreground">Paradas restantes</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da rota</span>
              <span>{Math.round(routeProgress)}%</span>
            </div>
            <Progress value={routeProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Bus Route */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            Rota do Ônibus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {busStops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      index <= currentStop
                        ? stop.isDestination
                          ? "bg-secondary border-secondary"
                          : "bg-primary border-primary"
                        : "bg-background border-muted-foreground"
                    }`}
                  />
                  {index < busStops.length - 1 && (
                    <div className={`w-0.5 h-8 ${index < currentStop ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        index <= currentStop ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stop.name}
                    </p>
                    {index === currentStop && (
                      <Badge variant="secondary" className="text-xs">
                        <Bus className="h-3 w-3 mr-1" />
                        Atual
                      </Badge>
                    )}
                    {stop.isDestination && (
                      <Badge variant="outline" className="text-xs border-secondary text-secondary">
                        Seu destino
                      </Badge>
                    )}
                    {index < currentStop && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  {stop.distance > 0 && <p className="text-xs text-muted-foreground">{stop.distance.toFixed(1)} km</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bus Info */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 font-bold">
                {selectedBus.number}
              </div>
              <div>
                <p className="font-medium text-sm">{selectedBus.destination}</p>
                <p className="text-xs text-muted-foreground">Linha selecionada • {selectedBus.provider}</p>
              </div>
            </div>
            <Badge className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {selectedBus.capacity === "low"
                ? "Pouco cheio"
                : selectedBus.capacity === "medium"
                  ? "Moderado"
                  : "Muito cheio"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
