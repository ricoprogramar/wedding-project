// src/app.js
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import attendanceRoutes from "./features/attendance/attendance.routes.js";
import adminRoutes from "./features/admin/admin.routes.js";
import memoriesRoutes from "./features/memories/memories.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://boda.ricoprogramar.com", // PRODUCCIÓN
];


// ✅ CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// ✅ JSON
app.use(express.json());

// ✅ Rutas
app.use("/api/attendance", attendanceRoutes);
app.use("/api/invitation", adminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/memories", memoriesRoutes);


// CORRECCIÓN: subir DOS niveles
app.use(express.static(path.join(__dirname, "../../frontend")));

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// // STATIC DEFINITIVO (sirve todo uploads)
// app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// app.use(
//   "/uploads",
//   express.static(path.resolve(process.cwd(), "uploads"), {
//     etag: false,
//     lastModified: false,
//     maxAge: 0,
//   }),
// );

export default app;
