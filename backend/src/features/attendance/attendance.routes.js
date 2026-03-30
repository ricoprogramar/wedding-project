// src/features/attendance/attendance.routes.js
import express from "express";
import { confirmAttendance } from "./attendance.controller.js";
import { getAttendanceByToken } from "./getAttendance.controller.js";

const router = express.Router();

router.post("/", confirmAttendance);
router.get("/:token", getAttendanceByToken);

export default router;