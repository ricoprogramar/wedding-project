import archiver from "archiver";
import path from "path";
import fs from "fs";
import { pool } from "../../config/db.js";

export async function downloadMemories(req, res) {
  // const ids = req.query.ids?.split(",").map(Number).filter(Boolean);
  const ids = req.query.ids?.split(",").filter(Boolean);

  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: "No hay archivos seleccionados" });
  }

  // const { rows } = await pool.query(
  //   `
  //   SELECT file_path, file_name
  //   FROM memories
  //   WHERE id = ANY($1)
  //   `,
  //   [ids],
  // );

  const { rows } = await pool.query(
    `
  SELECT file_path, file_name
  FROM memories
  WHERE id = ANY($1::uuid[])
  `,
    [ids],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Archivos no encontrados" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="recuerdos-${Date.now()}.zip"`,
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  rows.forEach((file) => {
    const filePath = path.resolve(process.cwd(), file.file_path);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file.file_name });
    }
  });

  archive.finalize();
}
