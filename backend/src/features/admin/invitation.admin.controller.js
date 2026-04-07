import { pool } from "../../config/db.js";
import crypto from "crypto";

// Genera token único (equivalente a 'abc123')
function generateToken() {
  return crypto.randomBytes(4).toString("hex");
}

export async function createInvitationsBulk(req, res) {
  const client = await pool.connect();

  try {
    const { invitations } = req.body;

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return res.status(400).json({ message: "Invitaciones inválidas" });
    }

    await client.query("BEGIN");

    const createdInvitations = [];

    for (const inv of invitations) {
      const { mainGuestName, tableNumber, companions } = inv;
      const token = generateToken();

      // ✅ 1. INSERT invitations (como tu WITH invitation_data)
      const invitationResult = await client.query(
        `
        INSERT INTO invitations (token, main_guest_name, table_number)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [token, mainGuestName, tableNumber]
      );

      const invitationId = invitationResult.rows[0].id;

      // ✅ 2. Invitado principal (is_main = true)
      await client.query(
        `
        INSERT INTO guests (invitation_id, name, is_main)
        VALUES ($1, $2, true)
        `,
        [invitationId, mainGuestName]
      );

      // ✅ 3. Acompañantes (is_main = false)
      if (Array.isArray(companions)) {
        for (const name of companions) {
          await client.query(
            `
            INSERT INTO guests (invitation_id, name, is_main)
            VALUES ($1, $2, false)
            `,
            [invitationId, name]
          );
        }
      }

      createdInvitations.push({
        id: invitationId,
        mainGuestName,
        token
      });
    }

    await client.query("COMMIT");

    return res.status(201).json({
      created: createdInvitations.length,
      invitations: createdInvitations
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error al crear invitaciones" });
  } finally {
    client.release();
  }
}

export async function getInvitationByToken(req, res) {
  const { token } = req.params;

  try {
    // 1. Buscar invitación
    const invitationResult = await pool.query(
      `
      SELECT id, main_guest_name, table_number
      FROM invitations
      WHERE token = $1
      `,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.sendStatus(404);
    }

    const invitation = invitationResult.rows[0];

    // 2. Buscar invitados asociados
    const guestsResult = await pool.query(
      `
      SELECT name, is_main
      FROM guests
      WHERE invitation_id = $1
      `,
      [invitation.id]
    );

    const mainGuest = guestsResult.rows.find(g => g.is_main)?.name;

    const companions = guestsResult.rows
      .filter(g => !g.is_main)
      .map(g => g.name);

    // 3. Respuesta EXACTA para tu frontend
    return res.json({
      mainGuest,
      companions,
      table: invitation.table_number
    });

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

// Función para listar invitaciones (SIN duplicados y CON estado individual)
export async function listInvitations(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        i.id               AS invitation_id,
        i.token,
        i.table_number,
        i.main_guest_name,
        g.id               AS guest_id,
        g.name             AS guest_name,
        g.is_main,
        a.attending        AS attending
      FROM invitations i
      JOIN guests g
        ON g.invitation_id = i.id
      LEFT JOIN attendance a
        ON a.invitation_id = i.id
       AND a.guest_id = g.id
      ORDER BY i.id, g.is_main DESC
    `);

    const map = new Map();

    for (const row of result.rows) {
      if (!map.has(row.invitation_id)) {
        map.set(row.invitation_id, {
          id: row.invitation_id,
          token: row.token,
          table: row.table_number,
          confirmed: false,
          mainGuest: null,
          companions: []
        });
      }

      const invitation = map.get(row.invitation_id);

      // Si existe al menos una fila de attendance → invitación confirmada
      if (row.attending !== null) {
        invitation.confirmed = true;
      }

      // Invitado principal
      if (row.is_main) {
        invitation.mainGuest = {
          name: row.main_guest_name,
          attending: row.attending
        };
        continue;
      }

      // Acompañantes (1 fila = 1 persona, sin duplicar)
      invitation.companions.push({
        name: row.guest_name,
        attending: row.attending
      });
    }

    return res.json([...map.values()]);
  } catch (error) {
    console.error("Error listando invitaciones:", error);
    return res.sendStatus(500);
  }
}

// Obtener invitación para edición (por ID)
export async function getInvitationById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        i.id               AS invitation_id,
        i.token,
        i.table_number,
        g.id               AS guest_id,
        g.name             AS guest_name,
        g.is_main,
        a.attending        AS attending
      FROM invitations i
      JOIN guests g
        ON g.invitation_id = i.id
      LEFT JOIN attendance a
        ON a.invitation_id = i.id
       AND a.guest_id = g.id
      WHERE i.id = $1
      ORDER BY g.is_main DESC
    `, [id]);

    if (result.rows.length === 0) {
      return res.sendStatus(404);
    }

    const invitation = {
      id,
      table: result.rows[0].table_number,
      token: result.rows[0].token,
      mainGuest: null,
      companions: []
    };

    for (const row of result.rows) {
      if (row.is_main) {
        invitation.mainGuest = {
          name: row.guest_name,
          attending: row.attending
        };
      } else {
        invitation.companions.push({
          name: row.guest_name,
          attending: row.attending
        });
      }
    }

    return res.json(invitation);

  } catch (error) {
    console.error("Error obteniendo invitación por ID:", error);
    return res.sendStatus(500);
  }
}

// Actualizar mesa de una invitación (ADMIN)
export async function updateInvitationTable(req, res) {
  const { id } = req.params;
  const { tableNumber } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ message: "Mesa inválida" });
  }

  try {
    await pool.query(
      `
      UPDATE invitations
      SET table_number = $1
      WHERE id = $2
      `,
      [tableNumber, id]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return res.sendStatus(500);
  }
}