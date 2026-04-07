// src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    // Host donde se encuentra PostgreSQL (ej: localhost o IP del servidor)
  host: process.env.DB_HOST,

  // Puerto de PostgreSQL (por defecto 5432)
  port: process.env.DB_PORT,

  // Usuario con permisos sobre la base de datos
  user: process.env.DB_USER,

  // Contraseña del usuario
  password: process.env.DB_PASSWORD,

  // Nombre de la base de datos a la que nos conectamos
  database: process.env.DB_NAME,

  // Número máximo de conexiones activas en el pool
  max: 10,

  // Tiempo máximo (en ms) que una conexión puede estar inactiva
  // antes de ser cerrada automáticamente
  idleTimeoutMillis: 30000,
});