const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'employees.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    hire_date TEXT NOT NULL,
    document_url TEXT
  )
`);

// Add document_url to existing databases that pre-date this column.
const existingColumns = db.prepare('PRAGMA table_info(employees)').all();
const hasDocumentUrl = existingColumns.some((col) => col.name === 'document_url');
if (!hasDocumentUrl) {
  db.exec('ALTER TABLE employees ADD COLUMN document_url TEXT');
}

module.exports = db;
