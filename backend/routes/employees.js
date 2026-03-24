const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/employees - list all employees, optionally filter by department
router.get('/', (req, res) => {
  const { department } = req.query;
  let employees;
  if (department) {
    employees = db.prepare(
      'SELECT * FROM employees WHERE department = ? ORDER BY name'
    ).all(department);
  } else {
    employees = db.prepare('SELECT * FROM employees ORDER BY name').all();
  }
  res.json(employees);
});

// GET /api/employees/:id - get a single employee
router.get('/:id', (req, res) => {
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  res.json(employee);
});

// POST /api/employees - create a new employee
router.post('/', (req, res) => {
  const { name, email, department, role, hire_date, document_url } = req.body;
  if (!name || !email || !department || !role || !hire_date) {
    return res.status(400).json({ error: 'All fields are required: name, email, department, role, hire_date' });
  }
  try {
    const result = db.prepare(
      'INSERT INTO employees (name, email, department, role, hire_date, document_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, department, role, hire_date, document_url || null);
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'An employee with this email already exists' });
    }
    throw err;
  }
});

// PUT /api/employees/:id - update an employee
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  const { name, email, department, role, hire_date, document_url } = req.body;
  if (!name || !email || !department || !role || !hire_date) {
    return res.status(400).json({ error: 'All fields are required: name, email, department, role, hire_date' });
  }
  try {
    db.prepare(
      'UPDATE employees SET name = ?, email = ?, department = ?, role = ?, hire_date = ?, document_url = ? WHERE id = ?'
    ).run(name, email, department, role, hire_date, document_url || null, req.params.id);
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(employee);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'An employee with this email already exists' });
    }
    throw err;
  }
});

// DELETE /api/employees/:id - delete an employee
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
