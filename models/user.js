const { getDbConnection } = require('../config/database');

class User {
  static async getByUsername(username) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  static async create(username, password, email) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, password, email],
        (error) => {
          db.close();
          if (error) {
            reject(error);
          } else {
            resolve({ id: db.lastID, username, email });
          }
        }
      );
    });
  }

  static async storeMfaCode(userId, code, expiryMinutes = 5) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();

      const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);
      const expiryIsoString = expiryDate.toISOString();

      db.run(`DELETE FROM mfa_codes WHERE user_id = ?`, [userId], (error) => {
        if (error) {
          db.close();
          reject(error);
          return;
        }

        db.run(
          `INSERT INTO mfa_codes (user_id, code, expires_at) VALUES (?, ?, ?)`,
          [userId, code, expiryIsoString],
          function (error) {
            db.close();
            if (error) {
              reject(error);
            } else {
              resolve({ id: this.lastID, userId, code, expiryIsoString });
            }
          }
        );
      });
    });
  }

  static async verifyMfaCode(userId, mfaCode) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.get(
        `SELECT * FROM mfa_codes WHERE user_id = ? AND code = ? AND expires_at > datetime('now')`,
        [userId, mfaCode],
        (error, row) => {
          db.close();
          if (error) {
            return reject('Error verifying 2FA code');
          }
          if (!row) {
            return reject('Invalid 2FA code');
          }
          const remainingSeconds = Math.round((new Date(row.expires_at) - Date.now()) / 1000);
          if (remainingSeconds <= 0) {
            return reject('2FA code has expired');
          }
          resolve(true);
        }
      );
    });
  }

  static async removeMfaCode(userId) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      db.run(`DELETE FROM mfa_codes WHERE user_id = ?`, [userId], (error) => {
        db.close();
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async getEmailByUsername(username) {
    return new Promise((resolve, reject) => {
      const database = getDbConnection();
      database.get(`SELECT email FROM users WHERE username = ?`, [username], (error, result) => {
        database.close();
        if (error) {
          reject(error);
        } else {
          resolve(result ? result.email : null);
        }
      });
    });
  }
}

module.exports = User;
