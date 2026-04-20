"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'

interface AppSettings {
  primaryColor?: string
  backgroundColor?: string
  accentColor?: string
  companyLogoUrl?: string
}

const ThemeContext = createContext<AppSettings | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useFirestore()
  const settingsRef = useMemoFirebase(() => doc(db, 'appSettings', 'global'), [db])
  const { data: settings } = useDoc<AppSettings>(settingsRef)

  useEffect(() => {
    if (settings) {
      const root = document.documentElement
      if (settings.primaryColor) root.style.setProperty('--primary', hexToHsl(settings.primaryColor))
      if (settings.backgroundColor) root.style.setProperty('--background', hexToHsl(settings.backgroundColor))
      if (settings.accentColor) root.style.setProperty('--accent', hexToHsl(settings.accentColor))
    }
  }, [settings])

  return (
    <ThemeContext.Provider value={settings || null}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useAppSettings = () => useContext(ThemeContext)

// Helper to convert hex to HSL variables for Tailwind
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16)
    g = parseInt(hex.substring(3, 5), 16)
    b = parseInt(hex.substring(5, 7), 16)
  }
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}