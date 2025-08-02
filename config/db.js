// db.js
const fs = require('fs');
const path = require('path');

const devPath = path.join(__dirname, 'dev.js');
const db = fs.existsSync(devPath) ? require('./dev') : require('./prod');

const createTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT,
  country TEXT,
  state TEXT,
  address TEXT,
  phone_number TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT 0,
  reset_token TEXT,
  verification_token_created_at TEXT,
  education_level TEXT NOT NULL,
  reset_token_created_at DATETIME,
  is_moderator BOOLEAN DEFAULT 0
);`


const createSuperAdminTable = `CREATE TABLE IF NOT EXISTS super_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT,
  country TEXT,
  state TEXT,
  address TEXT,
  phone_number TEXT,
  is_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  verification_token_created_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

async function Xome(){
	await db.query(createTableQuery);
  
	console.log("Table Created Successfully")
}
Xome()
module.exports = db;
