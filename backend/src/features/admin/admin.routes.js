// src/features/admin/admin.routes.js
import express from "express";
import {    
    createInvitationsBulk, 
    getInvitationByToken,
    listInvitations,
    getInvitationById,
    updateInvitationTable
} from "./invitation.admin.controller.js";

const router = express.Router();

// 🔹 1. LISTA primero
router.get("/", listInvitations);

router.get("/edit/:id", getInvitationById);

router.put("/edit/:id/table", updateInvitationTable);

// 🔹 2. TOKEN después
router.get("/:token", getInvitationByToken);

// 🔹 3. POST
router.post("/", createInvitationsBulk);

export default router;