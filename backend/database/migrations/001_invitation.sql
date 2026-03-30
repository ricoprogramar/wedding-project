BEGIN;

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

COMMIT;