-- database/migrations/002_restriction.sql
-- Corrección: eliminar duplicados sin MIN(uuid)

DELETE FROM attendance a
USING attendance b
WHERE a.invitation_id = b.invitation_id
  AND a.guest_id = b.guest_id
  AND a.ctid > b.ctid;

ALTER TABLE attendance
ADD CONSTRAINT unique_attendance_per_guest
UNIQUE (invitation_id, guest_id);
