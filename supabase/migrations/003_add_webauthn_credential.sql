-- WebAuthn credential ID per user (device-bound, stored for reference)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webauthn_credential_id TEXT;
