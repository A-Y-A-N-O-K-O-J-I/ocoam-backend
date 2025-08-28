// db.js
const fs = require('fs');
const path = require('path');

const devPath = path.join(__dirname, 'dev.js');
const db = fs.existsSync(devPath) ? require('./dev') : require('./prod');
const isDev = fs.existsSync(devPath)
const createTableQuery = isDev ? `CREATE TABLE IF NOT EXISTS users (
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
);` : `CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
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
  is_verified INTEGER DEFAULT 0,
  reset_token TEXT,
  verification_token_created_at TEXT,
  education_level TEXT NOT NULL,
  reset_token_created_at TEXT,
  is_moderator INTEGER DEFAULT 0
);`

const createLibraryQuery2 = isDev ? `
CREATE TABLE IF NOT EXISTS library_files (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 library_id INTEGER NOT NULL,
 telegram_file_id TEXT NOT NULL,
 telegram_message_id INTEGER NOT NULL,
 original_name TEXT NOT NULL,
 file_size INTEGER,
 mime_type TEXT,
 upload_order INTEGER DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE
);
` : `
CREATE TABLE IF NOT EXISTS library_files (
  id SERIAL PRIMARY KEY,
  library_id INTEGER NOT NULL,
  telegram_file_id TEXT NOT NULL,
  telegram_message_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE
);

`

const createLibraryQuery = isDev ? `
CREATE TABLE IF NOT EXISTS library (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 description TEXT,
 upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
 uploaded_by INTEGER,
 total_files INTEGER DEFAULT 0,
 FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
` : `
CREATE TABLE IF NOT EXISTS library (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER,
  total_files INTEGER DEFAULT 0,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
`

const createClassesQuery = isDev ? `
CREATE TABLE IF NOT EXISTS live_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  subject TEXT,
  access_code TEXT UNIQUE,
  moderator_id INTEGER,
  status TEXT DEFAULT 'scheduled', -- scheduled, live, ended
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, scheduled_at TEXT DEFAULT "now",
  FOREIGN KEY (moderator_id) REFERENCES users(id)
);
` : `
CREATE TABLE IF NOT EXISTS live_classes (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subject TEXT,
  access_code TEXT UNIQUE,
  moderator_id INTEGER,
  status TEXT DEFAULT 'scheduled', -- scheduled, live, ended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moderator_id) REFERENCES users(id)
);
`;
async function Xome(){
	await db.query(createTableQuery);
  await db.query(createClassesQuery);
  await db.query(createLibraryQuery);
  await db.query(createLibraryQuery2);
  
	console.log("Table Created Successfully")
}
Xome()
module.exports = db;
