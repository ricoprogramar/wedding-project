// backend/src/features/memories/memories.controller.js
import fs from "fs";
import path from "path";

import {
  insertMemory,
  listVisibleMemories,
  countAdminMemories,
  getAdminMemoriesPaginated,
} from "./memories.service.js";

import { pool } from "../../config/db.js";

/* ========= Upload (público / QR) ========= */
export async function uploadMemories(req, res) {
  const { token } = req.body;

  if (!req.files?.length) {
    return res.status(400).json({ error: "Sin archivos" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT enabled, start_at, end_at FROM memories_config WHERE id = 1"
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

    if (config.end_at && now > new Date(config.end_at)) {
      return res.status(403).json({
        error: "Las subidas de recuerdos ya finalizaron.",
      });
    }

    for (const file of req.files) {
      await insertMemory({ token: token || null, file });
    }

    return res.json({ ok: true, count: req.files.length });
  } catch (e) {
    console.error("ERROR UPLOAD MEMORIES:", e);
    return res.status(500).json({ error: "Error guardando recuerdos" });
  }
}

/* ========= Galería pública ========= */
export async function getMemories(req, res) {
  try {
    const data = await listVisibleMemories();
    return res.json(data);
  } catch (e) {
    console.error("ERROR LIST MEMORIES:", e);
    return res.status(500).json({ error: "Error listando recuerdos" });
  }
}

/* ========= Configuración (ADMIN) ========= */
export async function getMemoriesConfig(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT enabled, start_at, end_at FROM memories_config WHERE id = 1"
    );
    return res.json(rows[0]);
  } catch (e) {
    console.error("ERROR GET MEMORIES CONFIG:", e);
    return res.status(500).json({ error: "Error cargando configuración" });
  }
}

export async function updateMemoriesConfig(req, res) {
  const { enabled, start_at, end_at } = req.body;
  try {
    await pool.query(
      "UPDATE memories_config SET enabled=$1, start_at=$2, end_at=$3 WHERE id=1",
      [enabled, start_at, end_at]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("ERROR UPDATE MEMORIES CONFIG:", e);
    return res.status(500).json({ error: "Error guardando configuración" });
  }
}

/* ========= Moderación (ADMIN) – PAGINADO ========= */
export async function getAdminMemories(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize) || 24, 1);

    const total = await countAdminMemories();
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    const offset = (page - 1) * pageSize;
    const data = await getAdminMemoriesPaginated({
      limit: pageSize,
      offset,
    });

    const from = total === 0 ? 0 : offset + 1;
    const to = Math.min(offset + pageSize, total);

    return res.json({
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        from,
        to,
      },
    });
  } catch (err) {
    console.error("ERROR PAGINACIÓN MEMORIES:", err);
    return res.status(500).json({ error: "Error paginando recuerdos" });
  }
}

/* ========= Toggle visibilidad ========= */
export async function updateMemoryVisibility(req, res) {
  const { id } = req.params;
  const { is_visible } = req.body;

  try {
    await pool.query(
      "UPDATE memories SET is_visible=$1 WHERE id=$2",
      [is_visible, id]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("ERROR UPDATE MEMORY VISIBILITY:", e);
    return res.status(500).json({ error: "Error actualizando visibilidad" });
  }
}

/* ========= Eliminación múltiple (ADMIN) ========= */
export async function deleteMemoriesBatch(req, res) {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No hay archivos seleccionados" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT file_path
      FROM memories
      WHERE id = ANY($1::uuid[])
      `,
      [ids]
    );

    // Eliminar archivos físicos
    for (const row of rows) {
      const filePath = path.resolve(process.cwd(), row.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar registros BD
    await pool.query(
      `
      DELETE FROM memories
      WHERE id = ANY($1::uuid[])
      `,
      [ids]
    );

    return res.json({ ok: true, deleted: ids.length });
  } catch (e) {
    console.error("ERROR DELETE MEMORIES:", e);
    return res.status(500).json({ error: "Error eliminando recuerdos" });
  }
}


