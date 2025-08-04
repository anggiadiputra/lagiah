import crypto from 'crypto'

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-characters-long'
const ALGORITHM = 'aes-256-ctr'

// Ensure the key is 32 characters (256 bits)
const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)

/**
 * Encrypt a string
 */
export function encrypt(text: string): string {
  if (!text) return text
  
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt a string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText
  
  try {
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedText // Return original if decryption fails
  }
}

/**
 * Hash a password using bcrypt-like method
 */
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt', 10000, 64, 'sha512').toString('hex')
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const hashedPassword = hashPassword(password)
  return hashedPassword === hash
} 