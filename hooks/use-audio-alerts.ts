"use client"

import { useCallback, useRef } from "react"

export function useAudioAlerts() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.log("[v0] Error creating audio context:", error)
      }
    }
    return audioContextRef.current
  }, [])

  const playBeep = useCallback(
    (frequency = 800, duration = 200, volume = 0.3) => {
      const audioContext = initAudioContext()
      if (!audioContext) return

      try {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration / 1000)

        console.log("[v0] Played beep:", frequency, "Hz for", duration, "ms")
      } catch (error) {
        console.log("[v0] Error playing beep:", error)
      }
    },
    [initAudioContext],
  )

  const playAlertSound = useCallback(() => {
    // Play a sequence of beeps for alerts
    playBeep(800, 200, 0.3)
    setTimeout(() => playBeep(1000, 200, 0.3), 300)
    setTimeout(() => playBeep(800, 200, 0.3), 600)
  }, [playBeep])

  const playDestinationAlert = useCallback(() => {
    // Play a more prominent sound for destination alerts
    playBeep(1200, 300, 0.4)
    setTimeout(() => playBeep(1000, 300, 0.4), 400)
    setTimeout(() => playBeep(1200, 500, 0.4), 800)
  }, [playBeep])

  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern)
        console.log("[v0] Vibration triggered:", pattern)
      } catch (error) {
        console.log("[v0] Error triggering vibration:", error)
      }
    } else {
      console.log("[v0] Vibration not supported")
    }
  }, [])

  return {
    playBeep,
    playAlertSound,
    playDestinationAlert,
    vibrate,
  }
}
