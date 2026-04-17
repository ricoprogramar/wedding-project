// backend/src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pkg;

/**
 * FIX DEFINITIVO:
 * Evita que node-postgres convierta automáticamente
 * TIMESTAMP WITHOUT TIME ZONE a Date (y desplace horas).
 *
 * 1114 = OID de TIMESTAMP WITHOUT TIME ZONE
 * Se fuerza a devolver STRING, no Date.
 */
types.setTypeParser(1114, (value) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});
