// src/features/admin/token.service.js
import crypto from "crypto";

export function generateToken() {
  return crypto.randomBytes(4).toString("hex");
}