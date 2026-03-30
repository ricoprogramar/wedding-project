// src/features/attendance/getAttendance.controller.js
import { pool } from "../../config/db.js";

export const getAttendanceByToken = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Obtener invitación + mesa
    const invitationResult = await pool.query(
      "SELECT id, table_number FROM invitations WHERE token = $1",
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ message: "Invitación no válida" });
    }

    const invitationId = invitationResult.rows[0].id;
    const table = invitationResult.rows[0].table_number;

    // 2. Obtener asistencia registrada
    const attendanceResult = await pool.query(
      `
      SELECT 
        g.name,
        a.attending
      FROM guests g
      LEFT JOIN attendance a
        ON a.guest_id = g.id
       AND a.invitation_id = $1
      WHERE g.invitation_id = $1
      `,
      [invitationId]
    );

    // 3. Verificar si ya confirmó
    const confirmed = attendanceResult.rows.some(
      row => row.attending !== null
    );

    if (!confirmed) {
      // Nunca ha confirmado
      return res.status(204).end();
    }

    // 4. Devolver estado confirmado
    return res.json({
      status: "CONFIRMED",
      table,
      attendance: attendanceResult.rows.map(row => ({
        name: row.name,
        attending: Boolean(row.attending),
      })),
    });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al obtener asistencia" });
  }
};