// src/features/admin/admin.routes.js
import express from "express";

import {    
    createInvitationsBulk, 
    getInvitationByToken,
    listInvitations,
    getInvitationById,
    updateInvitationTable,
    updateInvitationActive
} from "./invitation.admin.controller.js";

const router = express.Router();

//Enpoint de login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_KEY) {
    return res.sendStatus(200);
  }

  return res.sendStatus(401);
});

// 🔹 1. LISTA primero
router.get("/", listInvitations);

router.get("/edit/:id", getInvitationById);

router.put("/edit/:id/table", updateInvitationTable);

router.put("/edit/:id/active", updateInvitationActive);

// 🔹 2. TOKEN después
router.get("/:token", getInvitationByToken);

// 🔹 3. POST
router.post("/", createInvitationsBulk);

export default router;