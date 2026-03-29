// src/features/invitation/invitation.routes.js
import express from "express";
import { getInvitationByToken } from "./invitation.controller.js";

const router = express.Router();

router.get("/:token", getInvitationByToken);

export default router;