import express from "express";
import multer from "multer";
import path from "path";
import { uploadMemories, getMemories } from "./memories.controller.js";

const router = express.Router();

// ✅ FIX REAL: diskStorage con extensión
const storage = multer.diskStorage({
  destination: path.resolve(process.cwd(), "uploads", "memories"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});


const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

router.post("/upload", upload.array("files", 10), uploadMemories);
router.get("/list", getMemories);

// GET config (admin + público)
router.get("/config", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM memories_config WHERE id=1");
  res.json(rows[0]);
});

// PUT config (admin)
router.put("/config", async (req, res) => {
  const { enabled, start_at, end_at } = req.body;
  await pool.query(
    "UPDATE memories_config SET enabled=$1, start_at=$2, end_at=$3 WHERE id=1",
    [enabled, start_at, end_at]
  );
  res.sendStatus(204);
});

// Admin: listar TODOS los recuerdos (visibles + ocultos)
router.get("/admin/list", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT id, file_path, file_name, is_visible, created_at
    FROM memories
    ORDER BY created_at DESC
  `);
  res.json(rows);
});

// Admin: ocultar / mostrar recuerdo
router.put("/admin/:id/visibility", async (req, res) => {
  const { id } = req.params;
  const { is_visible } = req.body;

  await pool.query(
    "UPDATE memories SET is_visible=$1 WHERE id=$2",
    [is_visible, id]
  );

  res.sendStatus(204);
});
export default router;
