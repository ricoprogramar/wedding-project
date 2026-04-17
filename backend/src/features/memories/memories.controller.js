// backend/src/features/memories/memories.controller.js
import { insertMemory, listVisibleMemories } from "./memories.service.js";
import { pool } from "../../config/db.js";

/* ========= Upload (público / QR) ========= */
export async function uploadMemories(req, res) {
  const { token } = req.body;

  if (!req.files?.length) {
    return res.status(400).json({ error: "Sin archivos" });
  }

  try {
    // ===============================
    // VALIDAR CONFIGURACIÓN DE RECUERDOS
    // ===============================
    const { rows } = await pool.query(
      "SELECT enabled, start_at, end_at FROM memories_config WHERE id = 1",
    );

    const config = rows[0];
    const now = new Date();

    if (!config.enabled) {
      return res.status(403).json({
        error: "Las subidas de recuerdos están desactivadas.",
      });
    }

    if (config.start_at && now < new Date(config.start_at)) {
      return res.status(403).json({
        error: "Las subidas aún no están habilitadas.",
      });
    }

    // Finalizadas (now > end_at)
    if (config.end_at && now > new Date(config.end_at)) {
      return res.status(403).json({
        error: "Las subidas de recuerdos ya finalizaron.",
      });
    }

    // ===============================
    // SUBIR ARCHIVOS (lo que ya funcionaba)
    // ===============================
    for (const file of req.files) {
      await insertMemory({ token: token || null, file });
    }

    return res.json({ ok: true, count: req.files.length });
  } catch (e) {
    console.error("ERROR UPLOAD MEMORIES:", e);
    return res.status(500).json({ error: "Error guardando recuerdos" });
  }
}

// export async function uploadMemories(req, res) {
//   const { token } = req.body;
//   if (!req.files?.length) {
//     return res.status(400).json({ error: "Sin archivos" });
//   }

//   try {
//     for (const file of req.files) {
//       await insertMemory({ token: token || null, file });
//     }
//     return res.json({ ok: true, count: req.files.length });
//   } catch (e) {
//     console.error("❌ ERROR UPLOAD MEMORIES:", e);
//     return res.status(500).json({ error: "Error guardando recuerdos" });
//   }
// }

/* ========= Galería pública ========= */
export async function getMemories(req, res) {
  try {
    const data = await listVisibleMemories();
    return res.json(data);
  } catch (e) {
    console.error("❌ ERROR LIST MEMORIES:", e);
    return res.status(500).json({ error: "Error listando recuerdos" });
  }
}

/* ========= Configuración (ADMIN) ========= */
export async function getMemoriesConfig(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT enabled, start_at, end_at FROM memories_config WHERE id = 1",
    );
    return res.json(rows[0]);
  } catch (e) {
    console.error("❌ ERROR GET MEMORIES CONFIG:", e);
    return res.status(500).json({ error: "Error cargando configuración" });
  }
}

export async function updateMemoriesConfig(req, res) {
  const { enabled, start_at, end_at } = req.body;
  try {
    await pool.query(
      `UPDATE memories_config SET enabled=$1, start_at=$2, end_at=$3 WHERE id=1`,
      [enabled, start_at, end_at],
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ ERROR UPDATE MEMORIES CONFIG:", e);
    return res.status(500).json({ error: "Error guardando configuración" });
  }
}

/* ========= Moderación (ADMIN) ========= */
export async function getAdminMemories(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT id, file_path, file_name, is_visible, created_at
      FROM memories
      ORDER BY created_at DESC
    `);
    return res.json(rows);
  } catch (e) {
    console.error("❌ ERROR ADMIN LIST MEMORIES:", e);
    return res.status(500).json({ error: "Error listando recuerdos (admin)" });
  }
}

export async function updateMemoryVisibility(req, res) {
  const { id } = req.params;
  const { is_visible } = req.body;
  try {
    await pool.query("UPDATE memories SET is_visible=$1 WHERE id=$2", [
      is_visible,
      id,
    ]);
    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ ERROR UPDATE MEMORY VISIBILITY:", e);
    return res.status(500).json({ error: "Error actualizando visibilidad" });
  }
}
