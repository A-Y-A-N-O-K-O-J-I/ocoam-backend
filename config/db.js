// db.js
const fs = require('fs');
const path = require('path');

const devPath = path.join(__dirname, 'dev.js');
const db = fs.existsSync(devPath) ? require('./dev') : require('./prod');

const createTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  education_level TEXT,
  dob DATE NOT NULL,
  address TEXT,
  gender TEXT,
  country TEXT,
  state TEXT,
  is_admin BOOLEAN DEFAULT 0,
  is_super_admin BOOLEAN DEFAULT 0,
  phone_number TEXT,
  verification_token TEXT,
  is_verified INTEGER DEFAULT 0, -- 0 = false, 1 = true
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
