const db = require("../config/db"); // adjust path if needed

const SuperAdmin = {
  // Check if any super admin exists
  async exists() {
    const sql = "SELECT 1 FROM super_admins LIMIT 2";
    const result = await db.query(sql);
    return result.rows.length > 0;
  },

  // Create a new super admin
  async create(data) {
    const sql = `
      INSERT INTO super_admins (
        full_name,
        email,
        username,
        password,
        dob,
        gender,
        country,
        state,
        address,
        phone_number,
        verification_token,
        verification_token_created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      data.full_name,
      data.email,
      data.username,
      data.password,
      data.dob,
      data.gender,
      data.country,
      data.state,
      data.address,
      data.phone_number,
      data.verification_token,
      data.verification_token_created_at,
    ];

    const result = await db.query(sql, values);
    return result.rows[0];
  },

  // Find by email
  async findByEmail(email) {
    const sql = "SELECT * FROM super_admins WHERE email = $1";
    const result = await db.query(sql, [email]);
    return result.rows[0];
  },

  // Find by verification token
  async findByToken(token) {
    const sql = "SELECT * FROM super_admins WHERE verification_token = $1";
    const result = await db.query(sql, [token]);
    return result.rows[0];
  },

  // Mark as verified
  async verifyEmail(email) {
    const sql = `
      UPDATE super_admins
      SET is_verified = 1,
          verification_token = NULL,
          verification_token_created_at = NULL
      WHERE email = $1
      RETURNING *
    `;
    const result = await db.query(sql, [email]);
    return result.rows[0];
  },

  // Save a new verification token (e.g. for resend)
  async saveVerificationToken(email, token) {
    const sql = `
      UPDATE super_admins
      SET verification_token = $1,
          verification_token_created_at = $2
      WHERE email = $3
      RETURNING *
    `;
    const values = [token, new Date().toISOString(), email];
    const result = await db.query(sql, values);
    return result.rows[0];
  },

async findByUsernameOrEmail(identifier) {
  const sql = "SELECT * FROM super_admins WHERE username = $1 OR email = $1";
  const result = await db.query(sql, [identifier]);
  return result.rows[0];
},

async saveResetToken(id, token) {
  const sql = `UPDATE super_admins SET reset_token = $1 WHERE id = $2`;
  return await db.query(sql, [token, id]);
},

async findByResetToken(token) {
  const sql = `SELECT * FROM super_admins WHERE reset_token = $1`;
  const result = await db.query(sql, [token]);
  return result.rows[0];
},

async updatePassword(id, newPassword) {
  const sql = `
    UPDATE super_admins
    SET password = $1,
        reset_token = NULL
    WHERE id = $2
  `;
  return await db.query(sql, [newPassword, id]);
},



};

module.exports = SuperAdmin;
