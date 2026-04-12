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

export default router;
