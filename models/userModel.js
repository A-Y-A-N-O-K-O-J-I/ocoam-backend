const pool = require("../config/db");

const User = {
    async create(username, fullName, email, hashedPassword, verificationToken, dob, gender, country, state, address, phone_number) {
        const query = `INSERT INTO users (username, fullName, email, password, verification_token, dob, gender, country, state, address, phone_number) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
        const values = [username, fullName, email, hashedPassword, verificationToken, dob, gender, country, state, address, phone_number];
        return pool.query(query, values);
    },

    async findByUsername(username) {
        const query = `SELECT * FROM users WHERE username = $1`;
        const { rows } = await pool.query(query, [username]);
        return rows[0]; 
    },

    async findById(id) {
        const query = `SELECT id, username, fullName, email, dob, gender, country, state, address, phone_number, is_verified FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0]; 
    },

    async findByVerificationToken(token) {
        const query = `SELECT id FROM users WHERE verification_token = $1`;
        const { rows } = await pool.query(query, [token]);
        return rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0];
    },

    async updateVerificationToken(id, newToken) {
        await pool.query(
            "UPDATE users SET verification_token = $1, verification_token_created_at = NOW() WHERE id = $2",
            [newToken, id]
        );
    },

    async verifyUser(id) {
        const query = `UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },
	async findByResetToken(token) {
        const query = "SELECT * FROM users WHERE reset_token = $1";
        const { rows } = await pool.query(query, [token]);
        return rows[0]; // Return user if token matches
    },
async saveResetToken(userId, resetToken) {
    await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_created_at = NOW() WHERE id = $2",
        [resetToken, userId]
    );
},

 async isAdmin(identifier) {
    const result = await pool.query(
        "SELECT is_admin FROM users WHERE email = COALESCE(NULLIF($1, ''), NULLIF($2, '')) OR username = COALESCE(NULLIF($1, ''), NULLIF($2, ''))",
        [identifier, identifier]
    );
    return result.rows[0]?.is_admin || false;
},

async isSuperAdmin(identifier) {
    const result = await pool.query(
        "SELECT is_super_admin FROM users WHERE email = COALESCE(NULLIF($1, ''), NULLIF($2, '')) OR username = COALESCE(NULLIF($1, ''), NULLIF($2, ''))",
        [identifier, identifier]
    );
    return result.rows[0]?.is_super_admin || false;
},

async findByUsernameOrEmail(identifier) {
    const query = "SELECT * FROM users WHERE username = $1 OR email = $1";
    const result = await pool.query(query, [identifier]);
    return result.rows[0];
},

async clearResetToken(userId) {
    await pool.query(
        "UPDATE users SET reset_token = NULL, reset_token_created_at = NULL WHERE id = $1",
        [userId]
    );
},

    async updatePassword(userId, hashedPassword) {
        const query = `
            UPDATE users
            SET password = $1, reset_token = NULL, reset_token_created_at = NULL
            WHERE id = $2
        `;
        await pool.query(query, [hashedPassword, userId]);
    }
};

module.exports = User;
