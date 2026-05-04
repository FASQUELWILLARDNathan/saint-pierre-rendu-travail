export function isValidBigInt(value: string): boolean {
  try {
    BigInt(value)
    return !isNaN(Number(value)) && Number(value) > 0
  } catch {
    return false
  }
}
