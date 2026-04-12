CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  invitation_token TEXT NOT NULL,

  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,

  is_video BOOLEAN NOT NULL DEFAULT false,

  is_visible BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_memories_token
  ON memories (invitation_token);

CREATE INDEX IF NOT EXISTS idx_memories_visible
  ON memories (is_visible);

CREATE INDEX IF NOT EXISTS idx_memories_created
  ON memories (created_at DESC);