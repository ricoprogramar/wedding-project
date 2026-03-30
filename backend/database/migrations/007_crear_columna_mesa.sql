

ALTER TABLE invitations
ADD COLUMN table_number VARCHAR(20);


UPDATE invitations
SET table_number = 'Mesa 1'
WHERE table_number IS NULL;
