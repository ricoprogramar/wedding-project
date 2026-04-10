// src/app.js

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import attendanceRoutes from "./features/attendance/attendance.routes.js";
import adminRoutes from "./features/admin/admin.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// rutas bien definidas
app.use("/api/attendance", attendanceRoutes);
app.use("/api/invitation", adminRoutes);

app.use("/frontend", express.static(path.join(__dirname, "../frontend")));


console.log("🚀 RUTAS ADMIN CARGADAS");
export default app;