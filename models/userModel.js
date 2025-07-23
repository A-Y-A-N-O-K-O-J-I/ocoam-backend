const pool = require("../config/db");

const User = {
    async create(fullName, email, username, hashedPassword,education_level,verificationToken,dob,address,gender,country,state,phone_number,verified_token_created_at) {
        const query = `INSERT INTO users (full_name, email, username, password,education_level,verification_token,dob,address,gender,country,state,phone_number,verification_token_created_at) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13) RETURNING *;`;
        const values = [fullName, email, username, hashedPassword,education_level, verificationToken, dob,address ,gender, country, state, phone_number,verified_token_created_at];
        return pool.query(query, values);
    },

    async findByUsername(username) {
        const query = `SELECT * FROM users WHERE username = $1`;
        const { rows } = await pool.query(query, [username]);
        return rows[0]; 
    },

    async findById(id) {
        const query = `SELECT * FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0]; 
    },

    async findByVerificationToken(token) {
        const query = `SELECT * FROM users WHERE verification_token = $1`;
        const { rows } = await pool.query(query, [token]);
        return rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0];
    },

    async updateVerificationToken(id, newToken) {
        const now = new Date();
const createdAt = now.toISOString()
        await pool.query(
            "UPDATE users SET verification_token = $1, verification_token_created_at = $2 WHERE id = $3",
            [newToken,createdAt,id]
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
	const now = new Date();
    await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_created_at = $2 WHERE id = $3",
        [resetToken,now.toISOString() ,userId]
    );
},

async findByUsernameOrEmail(identifier) {
    const query = "SELECT * FROM users WHERE username = $1 OR email = $2";
    const result = await pool.query(query, [identifier,identifier]);
    return result.rows[0];
},
async checkUsername(identifier) {
    const query = "SELECT id FROM users WHERE username = $1";
    const result = await pool.query(query, [identifier]);
    return result.rows[0];
},
async checkEmail(identifier) {
    const query = "SELECT * FROM users WHERE email = $1";
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
