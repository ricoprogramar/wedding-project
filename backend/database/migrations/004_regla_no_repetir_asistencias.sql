-- Un invitado solo puede tener UNA confirmación por invitación
ALTER TABLE attendance
ADD CONSTRAINT unique_attendance_per_guest
UNIQUE (invitation_id, guest_id);