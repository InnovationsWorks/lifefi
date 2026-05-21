export const BIOMETRIC_CRED_KEY = "lifefi_biometric_cred_id"
export const BIOMETRIC_EMAIL_KEY = "lifefi_biometric_email"
export const BIOMETRIC_DECLINED_KEY = "lifefi_biometric_declined"
export const SESSION_LOCKED_KEY = "lifefi_session_locked"
export const LAST_ACTIVITY_KEY = "lifefi_last_activity"

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ""
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlToBuffer(b64: string): ArrayBuffer {
  const base64 = b64.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)
  return buffer
}

export function isBiometricSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  )
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export async function registerBiometric(
  userId: string,
  userEmail: string,
  displayName: string
): Promise<string | null> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userIdBytes = new TextEncoder().encode(userId.slice(0, 64))

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "LifeFi", id: window.location.hostname },
        user: { id: userIdBytes, name: userEmail, displayName: displayName || userEmail },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null

    if (!credential) return null
    return bufferToBase64url(credential.rawId)
  } catch {
    return null
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const credId = localStorage.getItem(BIOMETRIC_CRED_KEY)
  if (!credId) return false
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          { id: base64urlToBuffer(credId), type: "public-key", transports: ["internal"] },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    return !!assertion
  } catch {
    return false
  }
}

export function clearBiometricData(): void {
  localStorage.removeItem(BIOMETRIC_CRED_KEY)
  localStorage.removeItem(BIOMETRIC_EMAIL_KEY)
  localStorage.removeItem(BIOMETRIC_DECLINED_KEY)
  localStorage.removeItem(SESSION_LOCKED_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}
