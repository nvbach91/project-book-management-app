const db = require('../config/db');

exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
};

exports.createUser = (req, res) => {
  const { email, password_hash, display_name, role } = req.body;
  const sql = 'INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';

  db.query(sql, [email, password_hash, display_name, role], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User created', userId: result.insertId });
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { email, password_hash, display_name, role } = req.body;
  const sql = 'UPDATE users SET email=?, password_hash=?, display_name=?, role=?, updated_at=NOW() WHERE user_id=?';

  db.query(sql, [email, password_hash, display_name, role, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
};
