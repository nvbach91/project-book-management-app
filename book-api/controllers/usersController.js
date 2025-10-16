const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT user_id, email, display_name, role, created_at, updated_at FROM users');
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await pool.query('SELECT user_id, email, display_name, role, created_at, updated_at FROM users WHERE user_id = ?', [userId]);
    if (results.length === 0) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, display_name, password } = req.body;
    if (!email || !display_name || !password) {
      return res.status(400).json({ message: 'Email, display name, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [results] = await pool.query('INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)', [email, display_name, password_hash]);
    return res.status(201).json({ message: 'User created', userId: results.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { display_name } = req.body;
    const [results] = await pool.query('UPDATE users SET display_name=? WHERE user_id=?', [display_name, userId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User updated' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await pool.query('DELETE FROM users WHERE user_id=?', [userId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

