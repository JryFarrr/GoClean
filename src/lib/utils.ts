// Utility functions for the application

export function parseJsonArray(value: string | string[] | undefined | null): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options
  }
  return new Date(date).toLocaleDateString('id-ID', defaultOptions)
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export const WASTE_TYPE_LABELS: Record<string, string> = {
  ORGANIC: 'Organik',
  PLASTIC: 'Plastik',
  PAPER: 'Kertas',
  METAL: 'Logam',
  GLASS: 'Kaca',
  ELECTRONIC: 'Elektronik',
  OTHER: 'Lainnya'
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Diterima', color: 'bg-blue-100 text-blue-800' },
  ON_THE_WAY: { label: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800' },
  PICKED_UP: { label: 'Sudah Dijemput', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

// Calculate price modifier based on distance (closer = higher price, farther = lower price)
export function getPriceModifier(distanceKm: number): { modifier: number; label: string; color: string } {
  if (distanceKm <= 1) {
    return { modifier: 1.0, label: 'Harga Normal (100%)', color: 'text-green-600' }
  } else if (distanceKm <= 3) {
    return { modifier: 0.95, label: 'Diskon 5%', color: 'text-blue-600' }
  } else if (distanceKm <= 5) {
    return { modifier: 0.9, label: 'Diskon 10%', color: 'text-yellow-600' }
  } else if (distanceKm <= 10) {
    return { modifier: 0.85, label: 'Diskon 15%', color: 'text-orange-600' }
  } else {
    return { modifier: 0.8, label: 'Diskon 20%', color: 'text-red-600' }
  }
}

// Extract district (kecamatan) from address
export function extractDistrict(address: string): string {
  // Common patterns for Indonesian addresses
  const patterns = [
    /kec(?:amatan)?\.?\s*([^,]+)/i,
    /,\s*([^,]+)\s*,\s*(?:kota|kabupaten)/i,
  ]
  
  for (const pattern of patterns) {
    const match = address.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Fallback: try to get district from comma-separated parts
  const parts = address.split(',').map(p => p.trim())
  if (parts.length >= 3) {
    return parts[parts.length - 3] // Usually district is 3rd from last
  }
  
  return ''
}
