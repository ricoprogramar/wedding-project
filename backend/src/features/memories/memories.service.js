// backend/src/features/memories/memories.service.js
import { pool } from "../../config/db.js";

// INSERT de recuerdo (token opcional + file_path WEB)
export async function insertMemory({ token, file }) {
  const isVideo = file.mimetype.startsWith("video/");

  // ✅ USAR filename (nombre real guardado por multer)
  const webPath = `uploads/memories/${file.filename}`;

  const { rows } = await pool.query(
    `
    INSERT INTO memories
      (invitation_token, file_path, file_name, mime_type, is_video)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [
      token || null,
      webPath, // ✅ ruta web
      file.originalname, // solo informativo
      file.mimetype,
      isVideo,
    ],
  );

  return rows[0];
}

// LISTADO público
export async function listVisibleMemories() {
  const { rows } = await pool.query(`
    SELECT id, file_path, file_name, mime_type, is_video, created_at
    FROM memories
    WHERE is_visible = true
    ORDER BY created_at DESC
  `);
  return rows;
}

/* =========================
   Admin – contar recuerdos
========================= */
export async function countAdminMemories() {
  const { rows } = await pool.query(`
    SELECT COUNT(*)::int AS total
    FROM memories
  `);
  return rows[0].total;
}

/* =========================
   Admin – paginados
========================= */
export async function getAdminMemoriesPaginated({ limit, offset }) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      file_path,
      file_name,
      is_visible,
      created_at
    FROM memories
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return rows;
}
