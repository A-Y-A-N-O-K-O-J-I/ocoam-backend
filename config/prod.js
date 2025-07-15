// prod.js
require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function close() {
  await pool.end(); // closes the entire pool
}

module.exports = {
  async query(text, params) {
    const res = await pool.query(text, params);
    return { rows: res.rows }; // ✅ wrap in .rows
  },
  close
};
