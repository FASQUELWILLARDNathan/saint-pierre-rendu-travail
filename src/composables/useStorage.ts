/**
 * Wrapper autour du localStorage et cookies pour lire et écrire des données typées.
 */
export function useStorage() {
  // Clés sensibles à stocker dans les cookies
  const COOKIE_KEYS = ['token', 'user']

  /**
   * Définit un cookie
   */
  const setCookie = (name: string, value: string, days = 7) => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Strict`
  }

  /**
   * Récupère un cookie
   */
  const getCookie = (name: string) => {
    const nameEQ = `${name}=`
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length))
      }
    }
    return null
  }

  /**
   * Supprime un cookie
   */
  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  /**
   * Lit une valeur depuis les cookies ou localStorage.
   * Les clés sensibles vont dans les cookies.
   */
  const get = <T>(key: string): T | null => {
    let item: string | null = null

    if (COOKIE_KEYS.includes(key)) {
      item = getCookie(key)
    } else {
      item = localStorage.getItem(key)
    }

    if (!item) return null
    try {
      return JSON.parse(item) as T
    } catch {
      return item as unknown as T
    }
  }

  /**
   * Écrit une valeur dans les cookies ou localStorage.
   * Les clés sensibles vont dans les cookies.
   */
  const set = <T>(key: string, value: T) => {
    const jsonValue = JSON.stringify(value)
    if (COOKIE_KEYS.includes(key)) {
      if (value === null) {
        removeCookie(key)
      } else {
        setCookie(key, jsonValue)
      }
    } else {
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, jsonValue)
      }
    }
  }

  /**
   * Supprime une ou plusieurs clés des cookies/localStorage.
   */
  const remove = (...keys: string[]) => {
    keys.forEach((key) => {
      if (COOKIE_KEYS.includes(key)) {
        removeCookie(key)
      } else {
        localStorage.removeItem(key)
      }
    })
  }

  return { get, set, remove }
}
