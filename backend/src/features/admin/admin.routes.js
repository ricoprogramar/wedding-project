// src/features/admin/admin.routes.js
import express from "express";

import {
  createInvitationsBulk,
  getInvitationByToken,
  listInvitations,
  getInvitationById,
  updateInvitationTable,
  updateInvitationActive,
  deleteInvitation,
} from "./invitation.admin.controller.js";

const router = express.Router();

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_KEY) {
    return res.sendStatus(200);
  }

  return res.sendStatus(401);
});

// LISTAR
router.get("/", listInvitations);

// EDITAR
router.get("/edit/:id", getInvitationById);
router.put("/edit/:id/table", updateInvitationTable);
router.put("/edit/:id/active", updateInvitationActive);

// ELIMINAR
router.delete("/:id", deleteInvitation);

// CREAR
router.post("/", createInvitationsBulk);

// SIEMPRE AL FINAL
router.get("/:token", getInvitationByToken);

export default router;

