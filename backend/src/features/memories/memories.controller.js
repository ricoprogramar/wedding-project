// backend/src/features/memories/memories.controller.js
import { insertMemory, listVisibleMemories } from "./memories.service.js";

// backend/src/features/memories/memories.controller.js

export async function uploadMemories(req, res) {
  const { token } = req.body; // puede venir vacío
  if (!req.files?.length)
    return res.status(400).json({ error: "Sin archivos" });

  try {
    for (const file of req.files) {
      await insertMemory({ token: token || null, file });
    }
    return res.json({ ok: true, count: req.files.length });
  } catch (e) {
    console.error("❌ ERROR UPLOAD MEMORIES:", e);
    return res.status(500).json({ error: "Error guardando recuerdos" });
  }
}

export async function getMemories(req, res) {
  try {
    const data = await listVisibleMemories();
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error listando recuerdos" });
  }
}

