// src/features/attendance/attendance.controller.js
import { pool } from "../../config/db.js";

export const confirmAttendance = async (req, res) => {
  const client = await pool.connect();

  try {
    const { token, confirmName, attendance } = req.body;

    await client.query("BEGIN");

    const invitationResult = await client.query(
      "SELECT id FROM invitations WHERE token = $1",
      [token]
    );

    if (invitationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Invitación no válida" });
    }

    const invitationId = invitationResult.rows[0].id;

    // ✅ Protección one‑shot
    const existing = await client.query(
      "SELECT 1 FROM attendance WHERE invitation_id = $1 LIMIT 1",
      [invitationId]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "already_confirmed" });
    }

    const guestsResult = await client.query(
      "SELECT id, name FROM guests WHERE invitation_id = $1",
      [invitationId]
    );

    const guestsMap = new Map();
    guestsResult.rows.forEach(g => guestsMap.set(g.name, g.id));

    for (const guest of attendance) {
      const guestId = guestsMap.get(guest.name);
      if (!guestId) continue;

      await client.query(
        `
        INSERT INTO attendance (invitation_id, guest_id, attending, confirmed_by)
        VALUES ($1, $2, $3, $4)
        `,
        [invitationId, guestId, guest.attending, confirmName]
      );
    }

    await client.query("COMMIT");
    return res.json({ message: "confirmed" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  } finally {
    client.release();
  }
};