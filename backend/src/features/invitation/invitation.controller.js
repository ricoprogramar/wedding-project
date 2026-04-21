// src/features/invitation/invitation.controller.js
import { pool } from "../../config/db.js";

export const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Invitación
    const invitationResult = await pool.query(
      "SELECT id, token, table_number FROM invitations WHERE token = $1",
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }

    const invitation = invitationResult.rows[0];

    // 2. Invitados
    const guestsResult = await pool.query(
      "SELECT id, name, is_main FROM guests WHERE invitation_id = $1",
      [invitation.id]
    );

    const mainGuest = guestsResult.rows.find(g => g.is_main);
    const companions = guestsResult.rows.filter(g => !g.is_main);

    // 3. ¿Ya confirmó?
    const attendanceResult = await pool.query(
      "SELECT 1 FROM attendance WHERE invitation_id = $1 LIMIT 1",
      [invitation.id]
    );

    const confirmed = attendanceResult.rows.length > 0;

    return res.json({
      token: invitation.token,
      mainGuest: mainGuest?.name,
      companions: companions.map(g => g.name),
      confirmed,
      table: confirmed ? invitation.table_number : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

