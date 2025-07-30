// Utility functions for expiration status and styling

export interface ExpirationStatus {
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN'
  daysUntilExpiry: number | null
  cssClass: string
}

/**
 * Calculate expiration status based on expiration date
 * @param expiresAt - ISO date string or null
 * @param warningDays - Number of days before expiry to show warning (default: 30)
 * @returns ExpirationStatus object with status, days until expiry, and CSS class
 */
export function calculateExpirationStatus(expiresAt: string | null | undefined, warningDays: number = 30): ExpirationStatus {
  if (!expiresAt) {
    return {
      status: 'UNKNOWN',
      daysUntilExpiry: null,
      cssClass: 'bg-gray-100 text-gray-800'
    }
  }

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    // Expired
    return {
      status: 'EXPIRED',
      daysUntilExpiry: Math.abs(diffDays),
      cssClass: 'bg-red-100 text-red-800'
    }
  } else if (diffDays <= warningDays) {
    // Expiring soon (within warning days)
    return {
      status: 'EXPIRING_SOON',
      daysUntilExpiry: diffDays,
      cssClass: 'bg-yellow-100 text-yellow-800'
    }
  } else {
    // Active
    return {
      status: 'ACTIVE',
      daysUntilExpiry: diffDays,
      cssClass: 'bg-green-100 text-green-800'
    }
  }
}

/**
 * Calculate expiration status for VPS (7-day warning period)
 * @param expiresAt - ISO date string or null
 * @param warningDays - Number of days before expiry to show warning (default: 7 for VPS)
 * @returns ExpirationStatus object with status, days until expiry, and CSS class
 */
export function calculateVPSExpirationStatus(expiresAt: string | null | undefined, warningDays: number = 7): ExpirationStatus {
  if (!expiresAt) {
    return {
      status: 'UNKNOWN',
      daysUntilExpiry: null,
      cssClass: 'bg-gray-100 text-gray-800'
    }
  }

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    // Expired
    return {
      status: 'EXPIRED',
      daysUntilExpiry: Math.abs(diffDays),
      cssClass: 'bg-red-100 text-red-800'
    }
  } else if (diffDays <= warningDays) {
    // Expiring soon (within warning days)
    return {
      status: 'EXPIRING_SOON',
      daysUntilExpiry: diffDays,
      cssClass: 'bg-yellow-100 text-yellow-800'
    }
  } else {
    // Active
    return {
      status: 'ACTIVE',
      daysUntilExpiry: diffDays,
      cssClass: 'bg-green-100 text-green-800'
    }
  }
}

/**
 * Get status class for hosting/domain based on their status field
 * @param status - Status string from database
 * @returns CSS class string
 */
export function getStatusClass(status: string): string {
  switch (status) {
    case 'ACTIVE': 
      return 'bg-green-100 text-green-800'
    case 'EXPIRING_SOON': 
      return 'bg-yellow-100 text-yellow-800'
    case 'EXPIRED': 
      return 'bg-red-100 text-red-800'
    case 'SUSPENDED': 
      return 'bg-orange-100 text-orange-800'
    case 'CANCELLED': 
      return 'bg-gray-100 text-gray-800'
    case 'TRANSFERRED': 
      return 'bg-blue-100 text-blue-800'
    case 'DELETED': 
      return 'bg-gray-100 text-gray-800'
    default: 
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get comprehensive status class that considers both database status and expiration date
 * @param status - Status string from database
 * @param expiresAt - ISO date string or null
 * @param warningDays - Number of days before expiry to show warning (default: 30)
 * @param isVPS - Whether this is a VPS (uses 7-day warning instead of 30)
 * @returns CSS class string prioritizing expiration status over database status
 */
export function getComprehensiveStatusClass(status: string, expiresAt: string | null | undefined, warningDays: number = 30, isVPS: boolean = false): string {
  // If we have an expiration date, prioritize expiration status
  if (expiresAt) {
    if (isVPS) {
      const expirationStatus = calculateVPSExpirationStatus(expiresAt, 7)
      return expirationStatus.cssClass
    } else {
      const expirationStatus = calculateExpirationStatus(expiresAt, warningDays)
      return expirationStatus.cssClass
    }
  }
  
  // Otherwise, use database status
  return getStatusClass(status)
}

/**
 * Format date for display
 * @param dateString - ISO date string or null
 * @returns Formatted date string or 'N/A'
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

/**
 * Get expiration message based on status (with VPS support)
 * @param expiresAt - ISO date string or null
 * @param warningDays - Number of days before expiry to show warning (default: 30)
 * @param isVPS - Whether this is a VPS (uses 7-day warning instead of 30)
 * @returns Human readable message
 */
export function getExpirationMessage(expiresAt: string | null | undefined, warningDays: number = 30, isVPS: boolean = false): string {
  if (!expiresAt) return 'No expiration date'
  
  if (isVPS) {
    const expirationStatus = calculateVPSExpirationStatus(expiresAt, 7)
    
    switch (expirationStatus.status) {
      case 'EXPIRED':
        return `Expired ${expirationStatus.daysUntilExpiry} days ago`
      case 'EXPIRING_SOON':
        return `Expires in ${expirationStatus.daysUntilExpiry} days`
      case 'ACTIVE':
        return `Expires in ${expirationStatus.daysUntilExpiry} days`
      default:
        return 'Unknown expiration'
    }
  } else {
    const expirationStatus = calculateExpirationStatus(expiresAt, warningDays)
    
    switch (expirationStatus.status) {
      case 'EXPIRED':
        return `Expired ${expirationStatus.daysUntilExpiry} days ago`
      case 'EXPIRING_SOON':
        return `Expires in ${expirationStatus.daysUntilExpiry} days`
      case 'ACTIVE':
        return `Expires in ${expirationStatus.daysUntilExpiry} days`
      default:
        return 'Unknown expiration'
    }
  }
} 