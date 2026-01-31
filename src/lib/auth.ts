import { v4 as uuidv4 } from 'uuid';

const AUTH_STORAGE_KEY = 'offlinepay_auth';
const DEVICE_ID_KEY = 'offlinepay_device_id';

// Session expires after 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// Lockout duration: 5 minutes
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
// Max failed attempts before lockout
const MAX_FAILED_ATTEMPTS = 3;

export interface AuthData {
  mobileNumber: string;
  pinHash: string;
  salt: string;
  deviceId: string;
  createdAt: number;
  lastLoginAt: number;
  sessionToken: string;
  sessionExpiry: number;
  failedAttempts: number;
  lockoutUntil?: number;
}

/**
 * Generate a random salt for PIN hashing
 */
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash PIN using SHA-256 with salt
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate or retrieve device ID
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `DEV_${uuidv4().split('-').join('').substring(0, 16).toUpperCase()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Generate a new session token
 */
function generateSessionToken(): string {
  return uuidv4();
}

/**
 * Get stored auth data
 */
export function getAuthData(): AuthData | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save auth data to localStorage
 */
export function saveAuthData(data: AuthData): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Clear auth data (logout)
 */
export function clearAuthData(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Check if user is new (no auth data exists)
 */
export function isNewUser(): boolean {
  return getAuthData() === null;
}

/**
 * Check if user is returning (has auth data)
 */
export function isReturningUser(): boolean {
  return getAuthData() !== null;
}

/**
 * Check if session is valid
 */
export function validateSession(): boolean {
  const authData = getAuthData();
  if (!authData) return false;
  
  const now = Date.now();
  
  // Check if session has expired
  if (now > authData.sessionExpiry) {
    return false;
  }
  
  // Check if device ID matches
  if (authData.deviceId !== getDeviceId()) {
    return false;
  }
  
  return true;
}

/**
 * Check if account is locked out
 */
export function isLockedOut(): { locked: boolean; remainingMs: number } {
  const authData = getAuthData();
  if (!authData || !authData.lockoutUntil) {
    return { locked: false, remainingMs: 0 };
  }
  
  const now = Date.now();
  if (now < authData.lockoutUntil) {
    return { locked: true, remainingMs: authData.lockoutUntil - now };
  }
  
  // Lockout expired, reset failed attempts
  authData.failedAttempts = 0;
  authData.lockoutUntil = undefined;
  saveAuthData(authData);
  
  return { locked: false, remainingMs: 0 };
}

/**
 * Create a new user account
 */
export async function createAccount(mobileNumber: string, pin: string): Promise<AuthData> {
  const salt = generateSalt();
  const pinHash = await hashPin(pin, salt);
  const deviceId = getDeviceId();
  const sessionToken = generateSessionToken();
  const now = Date.now();
  
  const authData: AuthData = {
    mobileNumber,
    pinHash,
    salt,
    deviceId,
    createdAt: now,
    lastLoginAt: now,
    sessionToken,
    sessionExpiry: now + SESSION_DURATION_MS,
    failedAttempts: 0,
  };
  
  saveAuthData(authData);
  return authData;
}

/**
 * Verify PIN and login
 */
export async function verifyPin(pin: string): Promise<{ success: boolean; message: string }> {
  const authData = getAuthData();
  if (!authData) {
    return { success: false, message: 'No account found' };
  }
  
  // Check lockout
  const lockout = isLockedOut();
  if (lockout.locked) {
    const remainingMinutes = Math.ceil(lockout.remainingMs / 60000);
    return { 
      success: false, 
      message: `Account locked. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.` 
    };
  }
  
  const pinHash = await hashPin(pin, authData.salt);
  
  if (pinHash === authData.pinHash) {
    // Success - reset failed attempts and create new session
    const now = Date.now();
    authData.failedAttempts = 0;
    authData.lockoutUntil = undefined;
    authData.lastLoginAt = now;
    authData.sessionToken = generateSessionToken();
    authData.sessionExpiry = now + SESSION_DURATION_MS;
    saveAuthData(authData);
    
    return { success: true, message: 'Login successful' };
  } else {
    // Failed attempt
    authData.failedAttempts += 1;
    
    if (authData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      authData.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      saveAuthData(authData);
      return { 
        success: false, 
        message: 'Too many failed attempts. Account locked for 5 minutes.' 
      };
    }
    
    saveAuthData(authData);
    const remaining = MAX_FAILED_ATTEMPTS - authData.failedAttempts;
    return { 
      success: false, 
      message: `Incorrect PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` 
    };
  }
}

/**
 * Extend session (called on app activity)
 */
export function extendSession(): void {
  const authData = getAuthData();
  if (authData && validateSession()) {
    authData.sessionExpiry = Date.now() + SESSION_DURATION_MS;
    saveAuthData(authData);
  }
}

/**
 * Logout - invalidate session
 */
export function logout(): void {
  const authData = getAuthData();
  if (authData) {
    authData.sessionToken = '';
    authData.sessionExpiry = 0;
    saveAuthData(authData);
  }
}

/**
 * Reset account (forgot PIN)
 */
export function resetAccount(): void {
  clearAuthData();
}

/**
 * Get masked mobile number for display
 */
export function getMaskedMobile(): string {
  const authData = getAuthData();
  if (!authData) return '';
  
  const mobile = authData.mobileNumber;
  if (mobile.length < 4) return mobile;
  
  // Show last 4 digits
  return '******' + mobile.slice(-4);
}

/**
 * Validate mobile number format (Indian)
 */
export function validateMobileNumber(mobile: string): { valid: boolean; message: string } {
  const cleaned = mobile.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return { valid: false, message: 'Mobile number must be 10 digits' };
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, message: 'Mobile number must start with 6-9' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate PIN format
 */
export function validatePin(pin: string): { valid: boolean; message: string } {
  if (pin.length !== 4) {
    return { valid: false, message: 'PIN must be 4 digits' };
  }
  
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, message: 'PIN must contain only numbers' };
  }
  
  // Check for sequential numbers
  const sequential = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'];
  if (sequential.includes(pin)) {
    return { valid: false, message: 'PIN is too simple. Avoid sequential numbers.' };
  }
  
  // Check for repeated digits
  if (/^(\d)\1{3}$/.test(pin)) {
    return { valid: false, message: 'PIN is too simple. Avoid repeated digits.' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Demo OTP verification (always accepts 123456)
 */
export function verifyOtp(otp: string): boolean {
  return otp === '123456';
}
