"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Bell, Volume2, Smartphone, ArrowLeft } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useAudioAlerts } from "@/hooks/use-audio-alerts"

interface AlertSettings {
  notifications: boolean
  sound: boolean
  vibration: boolean
  alertDistance: number // stops before destination
}

interface AlertSettingsProps {
  settings: AlertSettings
  onSettingsChange: (settings: AlertSettings) => void
  onBack: () => void
}

export function AlertSettingsComponent({ settings, onSettingsChange, onBack }: AlertSettingsProps) {
  const { permission, requestPermission } = useNotifications()
  const { playDestinationAlert, vibrate } = useAudioAlerts()

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const granted = await requestPermission()
      if (!granted) return
    }

    onSettingsChange({ ...settings, notifications: enabled })
  }

  const handleSoundToggle = (enabled: boolean) => {
    onSettingsChange({ ...settings, sound: enabled })
    if (enabled) {
      playDestinationAlert() // Test sound
    }
  }

  const handleVibrationToggle = (enabled: boolean) => {
    onSettingsChange({ ...settings, vibration: enabled })
    if (enabled) {
      vibrate([200, 100, 200]) // Test vibration
    }
  }

  const handleDistanceChange = (value: number[]) => {
    onSettingsChange({ ...settings, alertDistance: value[0] })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-semibold">Configurações de Alerta</h2>
          <p className="text-sm text-muted-foreground">Personalize seus alertas</p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Tipos de Alerta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Notificações Push
              </Label>
              <p className="text-xs text-muted-foreground">
                Receba alertas mesmo com o app em segundo plano
                {permission === "denied" && " (Bloqueado pelo navegador)"}
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={handleNotificationToggle}
              disabled={permission === "denied"}
            />
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound" className="text-sm font-medium">
                Alertas Sonoros
              </Label>
              <p className="text-xs text-muted-foreground">Toque um som quando próximo ao destino</p>
            </div>
            <Switch id="sound" checked={settings.sound} onCheckedChange={handleSoundToggle} />
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="vibration" className="text-sm font-medium">
                Vibração
              </Label>
              <p className="text-xs text-muted-foreground">Vibrar o dispositivo para alertas</p>
            </div>
            <Switch id="vibration" checked={settings.vibration} onCheckedChange={handleVibrationToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Alert Distance */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Distância do Alerta</CardTitle>
          <p className="text-sm text-muted-foreground">Quantas paradas antes do destino alertar</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Paradas antes do destino</span>
              <span className="font-medium">{settings.alertDistance}</span>
            </div>
            <Slider
              value={[settings.alertDistance]}
              onValueChange={handleDistanceChange}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 parada</span>
              <span>5 paradas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Alerts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Testar Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => playDestinationAlert()}
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Som
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vibrate([200, 100, 200, 100, 200])}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Vibração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
