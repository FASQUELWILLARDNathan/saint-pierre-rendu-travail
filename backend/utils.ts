// Vérifie si une chaîne de caractères représente un BigInt valide et strictement positif.
export function isValidBigInt(value: string): boolean {
  try {
    BigInt(value)
    return !isNaN(Number(value)) && Number(value) > 0
  } catch {
    return false
  }
}
