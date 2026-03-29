-- =========================
-- EXTENSIONES
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- TABLA: invitations
-- =========================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  main_guest_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABLA: guests
-- =========================
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,

  CONSTRAINT fk_invitation
    FOREIGN KEY (invitation_id)
    REFERENCES invitations(id)
    ON DELETE CASCADE
);

-- =========================
-- TABLA: attendance
-- =========================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  attending BOOLEAN NOT NULL,
  confirmed_by TEXT NOT NULL,
  confirmed_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_invitation_attendance
    FOREIGN KEY (invitation_id)
    REFERENCES invitations(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_guest_attendance
    FOREIGN KEY (guest_id)
    REFERENCES guests(id)
    ON DELETE CASCADE
);

-- =========================
-- ÍNDICES (performance real)
-- =========================
CREATE INDEX idx_invitation_token ON invitations(token);
CREATE INDEX idx_guests_invitation ON guests(invitation_id);
CREATE INDEX idx_attendance_invitation ON attendance(invitation_id);