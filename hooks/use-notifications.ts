"use client"

import { useState, useEffect, useCallback } from "react"

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported("Notification" in window)
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.log("[v0] Notifications not supported")
      return false
    }

    if (permission === "granted") {
      return true
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      console.log("[v0] Notification permission:", result)
      return result === "granted"
    } catch (error) {
      console.log("[v0] Error requesting notification permission:", error)
      return false
    }
  }, [isSupported, permission])

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        console.log("[v0] Cannot show notification - not supported or no permission")
        return null
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/favicon.ico",
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
        })

        console.log("[v0] Notification shown:", options.title)
        return notification
      } catch (error) {
        console.log("[v0] Error showing notification:", error)
        return null
      }
    },
    [isSupported, permission],
  )

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  }
}
