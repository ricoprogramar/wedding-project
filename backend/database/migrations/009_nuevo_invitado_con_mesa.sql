WITH invitation_data AS (
  INSERT INTO invitations (token, main_guest_name, table_number)
  VALUES ('abc123', 'Carlos Pérez', 'Mesa 10')
  RETURNING id
)
INSERT INTO guests (invitation_id, name, is_main)
SELECT id, name, is_main
FROM invitation_data,
(
  VALUES
    ('Carlos Pérez', true),
    ('Ana Pérez', false),
    ('Juan Pérez', false)
) AS g(name, is_main);