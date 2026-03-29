// src/app.js
import express from "express";
import cors from "cors";
import invitationRoutes from "./features/invitation/invitation.routes.js";
import attendanceRoutes from "./features/attendance/attendance.routes.js";

const app = express();

app.use(cors({
    origin: ["http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// routes
app.use("/api/invitation", invitationRoutes);

app.use("/api/attendance", attendanceRoutes);

export default app;