

UPDATE memories
SET file_path = replace(file_path, E'\\', '/');

SELECT file_path FROM memories;

