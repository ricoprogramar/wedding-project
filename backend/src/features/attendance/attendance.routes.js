// src/features/attendance/attendance.routes.js
import express from "express";
import { confirmAttendance } from "./attendance.controller.js";

const router = express.Router();

router.post("/", confirmAttendance);

export default router;