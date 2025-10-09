const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = (req, res) => {
  db.query('SELECT user_id, email, display_name, role, created_at, updated_at FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(results);
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id;
  db.query('SELECT user_id, email, display_name, role, created_at, updated_at FROM users WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
};

exports.createUser = (req, res) => {
  const { email, display_name, password } = req.body;
    if (!email || !display_name || !password) {
    return res.status(400).json({ message: 'Email, display name, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  bcrypt.hash(password, 10, (err, password_hash) => {
    if (err) {
      return res.status(500).json({ message: 'message hashing password' });
    }
    const sql = 'INSERT INTO users (email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())';
    db.query(sql, [email, display_name, password_hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ message: 'User created' });
    });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { display_name } = req.body;
  const sql = 'UPDATE users SET display_name=?, updated_at=NOW() WHERE user_id=?';
  db.query(sql, [display_name, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated' });
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE user_id=?', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
};