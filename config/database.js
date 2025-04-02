const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'database.sqlite');

const getDbConnection = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    }
  });
};

const initializeDatabase = () => {
  const db = getDbConnection();
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create mfa_codes table
    db.run(`
      CREATE TABLE IF NOT EXISTS mfa_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Insert target user if they don't exist
    db.get(`SELECT id FROM users WHERE username = 'wiener'`, (err, row) => {
      if (err) {
        console.error('Error checking for test user:', err.message);
      } else if (!row) {
        db.run(`
          INSERT INTO users (username, password, email) 
          VALUES ('ahmed', 'password', 'ahmed@mail.com')
        `);
      }
      db.close();
    });
  });
};

module.exports = {
  getDbConnection,
  initializeDatabase,
};
