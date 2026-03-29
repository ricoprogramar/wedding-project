DELETE FROM guests;
DELETE FROM invitations;

ALTER TABLE guests
ADD CONSTRAINT unique_guest_per_invitation
UNIQUE (invitation_id, name);


SELECT i.token, g.name, g.is_main
FROM invitations i
JOIN guests g ON g.invitation_id = i.id
WHERE i.token = 'abc123';

SELECT invitation_id, name, COUNT(*)
FROM guests
GROUP BY invitation_id, name
ORDER BY COUNT(*) DESC;

SELECT conname
FROM pg_constraint
WHERE conrelid = 'guests'::regclass;

WITH invitation_data AS (
  INSERT INTO invitations (token, main_guest_name)
  VALUES ('abc123', 'Edwar Velásquez')
  ON CONFLICT (token) DO UPDATE
  SET main_guest_name = EXCLUDED.main_guest_name
  RETURNING id
)

INSERT INTO guests (invitation_id, name, is_main)
SELECT id, name, is_main
FROM invitation_data,
(
  VALUES
    ('Edwar Velásquez', true),
    ('Adriana López', false),
    ('Juan Pérez', false)
) AS g(name, is_main)
ON CONFLICT (invitation_id, name) DO NOTHING;

SELECT i.token, g.name, g.is_main
FROM invitations i
JOIN guests g ON g.invitation_id = i.id
WHERE i.token = 'abc123';

SELECT 
  i.token,
  g.name,
  a.attending,
  a.confirmed_by,
  a.confirmed_at
FROM attendance a
JOIN invitations i ON i.id = a.invitation_id
JOIN guests g ON g.id = a.guest_id
ORDER BY a.confirmed_at DESC;