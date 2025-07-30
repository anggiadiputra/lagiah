/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the Rp symbol (default: true)
 * @returns Formatted currency string
 */
export function formatRupiah(amount: number | string | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Format with Indonesian locale
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)

  return showSymbol ? `Rp ${formatted}` : formatted
}

/**
 * Format number to Indonesian Rupiah currency with decimal places
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @param showSymbol - Whether to show the Rp symbol (default: true)
 * @returns Formatted currency string
 */
export function formatRupiahDecimal(amount: number | string | null | undefined, decimals: number = 0, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Format with Indonesian locale and specified decimals
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numAmount)

  return showSymbol ? `Rp ${formatted}` : formatted
}

/**
 * Parse Rupiah string back to number
 * @param rupiahString - The formatted Rupiah string
 * @returns Number value
 */
export function parseRupiah(rupiahString: string): number {
  if (!rupiahString) return 0

  // Remove Rp symbol and spaces, then replace dots with empty string
  const cleanString = rupiahString.replace(/[Rp\s.]/g, '').replace(',', '.')
  
  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number to compact Rupiah (e.g., Rp 2.5M, Rp 1.2K)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the Rp symbol (default: true)
 * @returns Formatted compact currency string
 */
export function formatRupiahCompact(amount: number | string | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return showSymbol ? 'Rp 0' : '0'
  }

  // Format with compact notation
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(numAmount)

  return showSymbol ? `Rp ${formatted}` : formatted
} 