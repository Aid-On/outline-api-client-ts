const STORAGE_KEY = 'outline-api-settings'

export interface ApiSettings {
  apiKey: string
  apiUrl: string
}

export const saveSettings = (settings: ApiSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }
}

export const loadSettings = (): ApiSettings | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored settings:', e)
        return null
      }
    }
  }
  return null
}

export const clearSettings = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}