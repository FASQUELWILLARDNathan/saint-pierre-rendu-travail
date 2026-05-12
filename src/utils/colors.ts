/**
 * Convertit une couleur hex en format rgba avec opacité
 * @param hex - Couleur au format hex (ex: #FF0000)
 * @param alpha - Opacité de 0 à 1 (ex: 0.5 = 50%)
 * @returns Couleur au format rgba
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
