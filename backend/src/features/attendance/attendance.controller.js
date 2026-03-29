// src/features/attendance/attendance.controller.js
import { pool } from "../../config/db.js";

export const confirmAttendance = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token, confirmName, attendance } = req.body;

    await client.query("BEGIN");

    // 1. Obtener invitación
    const invitationResult = await client.query(
      `SELECT id FROM invitations WHERE token = $1`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      throw new Error("Invitación no válida");
    }

    const invitationId = invitationResult.rows[0].id;

    // 2. Obtener invitados
    const guestsResult = await client.query(
      `SELECT id, name FROM guests WHERE invitation_id = $1`,
      [invitationId]
    );

    const guestsMap = new Map();
    guestsResult.rows.forEach(g => {
      guestsMap.set(g.name, g.id);
    });

    // 3. Insertar asistencia
    for (const guest of attendance) {
      const guestId = guestsMap.get(guest.name);

      if (!guestId) continue;

      await client.query(
        `INSERT INTO attendance (invitation_id, guest_id, attending, confirmed_by)
         VALUES ($1, $2, $3, $4)`,
        [invitationId, guestId, guest.attending, confirmName]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Asistencia confirmada" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error al confirmar asistencia" });
  } finally {
    client.release();
  }
};