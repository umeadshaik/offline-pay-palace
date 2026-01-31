
# Authentication System for OfflinePay

## Overview
Add a complete authentication system with mobile number + OTP signup, 4-digit PIN security, and offline access after initial login.

## Authentication Flow Diagram

```text
+------------------+     +------------------+     +------------------+
|   Welcome Screen |---->|  Mobile Number   |---->|  OTP Verification|
|   (New Users)    |     |     Entry        |     |   (6-digit code) |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
|   Home Screen    |<----|  Wallet Created  |<----|   Create PIN    |
|   (Main App)     |     |  (₹10,000 demo)  |     |   (4-digit)     |
+------------------+     +------------------+     +------------------+

+------------------+     +------------------+
|  Returning User  |---->|   Enter PIN      |---->  Home Screen
|   Auto-detect    |     |  (4-digit auth)  |
+------------------+     +------------------+
```

## New Files to Create

### 1. Authentication Storage (`src/lib/auth.ts`)
Handles all authentication data and security:
- `AuthData` interface with mobile, hashed PIN, device ID, session info
- `hashPin()` - Simple hash function for PIN (using Web Crypto API)
- `generateDeviceId()` - Create unique device fingerprint
- `createSession()` - Save session with expiry
- `validateSession()` - Check if user is logged in
- `verifyPin()` - Compare entered PIN with stored hash
- `isNewUser()` / `isReturningUser()` - Check auth state
- `linkWalletToAuth()` - Connect wallet data to authenticated user

### 2. Auth Context (`src/contexts/AuthContext.tsx`)
React context for global auth state:
- `isAuthenticated` state
- `isLoading` state
- `authData` (mobile number, etc.)
- `login()` / `logout()` / `signup()` methods
- Auto-session restoration on app load

### 3. Welcome Screen (`src/components/auth/WelcomeScreen.tsx`)
Beautiful splash screen for first-time users:
- OfflinePay branding with logo animation
- "Get Started" button
- "Already have an account? Login" link
- Purple gradient background matching app theme

### 4. Mobile Entry Screen (`src/components/auth/MobileEntryScreen.tsx`)
Phone number input:
- Country code selector (+91 India default)
- 10-digit mobile number input with validation
- "Send OTP" button
- Clean, minimal PhonePe-style design

### 5. OTP Verification Screen (`src/components/auth/OTPScreen.tsx`)
6-digit OTP entry:
- Uses existing `InputOTP` component
- Auto-focus and auto-submit
- 30-second resend timer
- Demo mode: Accept "123456" as valid OTP
- Success animation on verification

### 6. PIN Creation Screen (`src/components/auth/CreatePinScreen.tsx`)
4-digit PIN setup:
- Two-step: Enter PIN → Confirm PIN
- Numeric keypad UI (PhonePe-style)
- PIN dots visualization
- Strength indicator
- PIN stored as hash (not plain text)

### 7. Login Screen (`src/components/auth/LoginScreen.tsx`)
For returning users:
- Shows masked mobile number
- 4-digit PIN entry with numeric keypad
- "Forgot PIN?" option (resets to signup)
- 3 failed attempts = cooldown

### 8. Numeric Keypad Component (`src/components/auth/NumericKeypad.tsx`)
Reusable PIN input UI:
- 0-9 number buttons
- Backspace button
- Fingerprint/Face ID placeholder (future)
- Haptic feedback visual cues

## Files to Modify

### 1. `src/lib/storage.ts`
- Add `mobileNumber` field to `UserData` interface
- Add `authLinked: boolean` field
- Modify `getUserData()` to require authentication

### 2. `src/App.tsx`
- Wrap app in `AuthProvider`
- Add auth routes: `/welcome`, `/signup`, `/login`, `/verify-otp`, `/create-pin`
- Add `ProtectedRoute` component for authenticated pages

### 3. `src/pages/Index.tsx`
- Check authentication before showing main app
- Redirect to `/welcome` or `/login` if not authenticated

### 4. `src/components/HomeScreen.tsx`
- Show mobile number (masked) in header
- Add "Logout" option in settings

## Data Structure

### Auth Data (localStorage: `offlinepay_auth`)
```typescript
interface AuthData {
  mobileNumber: string;        // "+919876543210"
  pinHash: string;             // Hashed PIN
  deviceId: string;            // Unique device identifier
  createdAt: number;           // Timestamp
  lastLoginAt: number;         // Last successful login
  sessionToken: string;        // Current session
  sessionExpiry: number;       // Session expiration
  failedAttempts: number;      // For lockout
  lockoutUntil?: number;       // Lockout timestamp
}
```

### Session Management
- Session expires after 7 days of inactivity
- Offline access: Valid session allows app use without internet
- Session stored separately from wallet data for security

## Security Measures

1. **PIN Hashing**: Use `crypto.subtle.digest('SHA-256')` with salt
2. **Device Linking**: Generate unique device ID stored in localStorage
3. **Session Tokens**: Random UUID-based tokens with expiry
4. **Lockout**: 3 failed PIN attempts = 5-minute cooldown
5. **No Plain Text**: PIN never stored in readable form

## Offline Access Logic

```text
App Launch
    |
    v
Check localStorage for session
    |
    +---> Valid session? ---> YES ---> Show main app (offline OK)
    |
    +---> No/Expired? ---> Show login screen
                              |
                              v
                        PIN verification (offline)
                              |
                              v
                        Create new session ---> Main app
```

## UI/UX Details

### Color Scheme (matching existing)
- Primary: Purple gradient (#7C3AED → #5B21B6)
- Success: Green (#22C55E)
- Error: Red (#EF4444)
- Background: White/Gray cards

### Animations (Framer Motion)
- Screen transitions: Slide left/right
- PIN dots: Scale bounce on entry
- Success checkmark: Spring animation
- OTP boxes: Focus glow effect

### Component Styling
- Rounded corners (2xl, 3xl)
- Soft shadows
- Glass-morphism effects for headers
- Large touch targets for mobile

## Implementation Order

1. Create `src/lib/auth.ts` with all auth functions
2. Create `AuthContext` provider
3. Build `NumericKeypad` component (reused across screens)
4. Create auth screens in order: Welcome → Mobile → OTP → CreatePin → Login
5. Modify `App.tsx` with routes and protection
6. Update `Index.tsx` with auth checks
7. Update `HomeScreen.tsx` with user info display
8. Test complete flow

## Demo Mode Behavior
- OTP: "123456" always valid (no SMS)
- Mobile: Any valid 10-digit number accepted
- PIN: Any 4-digit number accepted
- Session: 7-day validity

## Technical Notes

- All auth data stored in `localStorage` (no backend)
- Existing wallet data preserved, linked to auth after signup
- Works fully offline after initial login
- Compatible with existing two-way QR payment flow
