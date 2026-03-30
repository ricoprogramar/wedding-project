ALTER TABLE attendance
ADD CONSTRAINT unique_attendance_per_guest
UNIQUE (invitation_id, guest_id);

DELETE FROM attendance
WHERE id NOT IN (
  SELECT MIN(id)
  FROM attendance
  GROUP BY invitation_id, guest_id
);