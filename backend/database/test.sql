UPDATE memories
SET file_path = regexp_replace(file_path, '^.*uploads[/\\]', 'uploads/');
