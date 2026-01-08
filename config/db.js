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

const createApplicationTableQuery = isDev ? `CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- Programme Selection
    programme TEXT NOT NULL CHECK (programme IN ('professional', 'advanced')),
    
    -- Personal Information
    surname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    othername TEXT,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    state_of_origin TEXT NOT NULL,
    lga TEXT NOT NULL,
    marital_status TEXT NOT NULL CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    
    -- Contact Information
    residential_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    alternative_phone TEXT,
    email TEXT NOT NULL,
    whatsapp_number TEXT,
    
    -- Educational Background
    qualification_route TEXT NOT NULL CHECK (qualification_route IN ('academic', 'practice')),
    highest_qualification TEXT,
    institution_name TEXT,
    graduation_year TEXT,
    experience_years TEXT,
    
    -- Traditional Medicine Background
    tm_background TEXT CHECK (tm_background IN ('yes', 'no')),
    tm_experience TEXT,
    motivation TEXT NOT NULL,
    
    -- Next of Kin
    nok_name TEXT NOT NULL,
    nok_relationship TEXT NOT NULL,
    nok_phone TEXT NOT NULL,
    nok_email TEXT,
    nok_address TEXT NOT NULL,
    
    -- Payment Information
    payment_option TEXT NOT NULL CHECK (payment_option IN ('full', 'three', 'four')),
    pioneer_discount_applied INTEGER DEFAULT 0,
    
    -- Document URLs
    passport_photo_url TEXT NOT NULL,
    birth_certificate_or_attestation_url TEXT NOT NULL,
    school_certificate_url TEXT,
    practice_documentation_url TEXT,
    medical_fitness_certificate_url TEXT,
    recommendation_letter_url TEXT,
    additional_certificates_url TEXT,
    
    -- Audit Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_created_at ON applications(created_at);` : `
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    
    -- Programme Selection
    programme VARCHAR(50) NOT NULL CHECK (programme IN ('professional', 'advanced')),
    
    -- Personal Information
    surname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    othername VARCHAR(100),
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    state_of_origin VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,
    marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    
    -- Contact Information
    residential_address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20),
    
    -- Educational Background
    qualification_route VARCHAR(20) NOT NULL CHECK (qualification_route IN ('academic', 'practice')),
    highest_qualification VARCHAR(50),
    institution_name VARCHAR(255),
    graduation_year VARCHAR(10),
    experience_years VARCHAR(50),
    
    -- Traditional Medicine Background
    tm_background VARCHAR(5) CHECK (tm_background IN ('yes', 'no')),
    tm_experience TEXT,
    motivation TEXT NOT NULL,
    
    -- Next of Kin
    nok_name VARCHAR(255) NOT NULL,
    nok_relationship VARCHAR(100) NOT NULL,
    nok_phone VARCHAR(20) NOT NULL,
    nok_email VARCHAR(255),
    nok_address TEXT NOT NULL,
    
    -- Payment Information
    payment_option VARCHAR(10) NOT NULL CHECK (payment_option IN ('full', 'three', 'four')),
    pioneer_discount_applied BOOLEAN DEFAULT FALSE,
    
    -- Document URLs
    passport_photo_url TEXT NOT NULL,
    birth_certificate_or_attestation_url TEXT NOT NULL,
    school_certificate_url TEXT,
    practice_documentation_url TEXT,
    medical_fitness_certificate_url TEXT,
    recommendation_letter_url TEXT,
    additional_certificates_url TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_created_at ON applications(created_at);
`
async function Xome(){
	await db.query(createTableQuery);
  await db.query(createClassesQuery);
  await db.query(createLibraryQuery);
  await db.query(createLibraryQuery2);
  await db.query(createApplicationTableQuery)
	console.log("Table Created Successfully")
}
Xome()
module.exports = db;
