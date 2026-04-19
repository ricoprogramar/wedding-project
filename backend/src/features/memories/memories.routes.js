import express from "express";
import multer from "multer";
import path from "path";

import {
  uploadMemories,
  // getMemories,
  getMemoriesConfig,
  updateMemoriesConfig,
  getAdminMemories,
  updateMemoryVisibility,
  deleteMemoriesBatch,
  getMemoriesPaginated,
} from "./memories.controller.js";

import { downloadMemories } from "./memories.download.js";

const router = express.Router();

/* ===============================
   Multer storage (NO tocar)
================================ */
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

/* ===============================
   Rutas públicas
================================ */

// Upload desde QR
router.post("/upload", upload.array("files", 10), uploadMemories);

// Galería pública
// router.get("/list", getMemories);
router.get("/list", getMemoriesPaginated);

/* ===============================
   Configuración (ADMIN)
================================ */

router.get("/config", getMemoriesConfig);
router.put("/config", updateMemoriesConfig);

/* ===============================
   Moderación (ADMIN)
================================ */

router.get("/admin/list", getAdminMemories);
router.put("/admin/:id/visibility", updateMemoryVisibility);

router.get("/admin/download", downloadMemories);
router.delete("/admin/batch", deleteMemoriesBatch);


export default router;
