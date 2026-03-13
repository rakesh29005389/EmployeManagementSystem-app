# Employee Management System

A full-stack Employee Management System built with Node.js/Express (backend), SQLite (database), and React (frontend).

## Features

- **CRUD operations** – Create, Read, Update, and Delete employee records
- **Employee fields** – ID, Name, Email, Department, Role, Hire Date
- **Search & filter** – Filter employees by department
- **RESTful API** – Clean REST endpoints with proper HTTP status codes
- **Error handling** – Validation, duplicate detection, and global error handler

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3
- **Database**: SQLite
- **Frontend**: React (Create React App)

## Project Structure

```
.
├── backend/
│   ├── db.js              # Database setup and connection
│   ├── server.js          # Express app entry point
│   └── routes/
│       └── employees.js   # Employee CRUD routes
├── frontend/
│   └── src/
│       ├── App.js         # Main app component
│       ├── App.css        # Styles
│       ├── components/
│       │   ├── EmployeeTable.js   # Employee list table
│       │   └── EmployeeForm.js    # Add/Edit form
│       └── services/
│           └── employeeService.js # API client
└── package.json           # Root scripts
```

## Getting Started

### 1. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the Backend

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees?department=Engineering` | Filter by department |
| GET | `/api/employees/:id` | Get a single employee |
| POST | `/api/employees` | Create a new employee |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

### Employee Object

```json
{
  "id": 1,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "department": "Engineering",
  "role": "Senior Engineer",
  "hire_date": "2022-01-15"
}
```

## Running Tests

```bash
cd frontend && CI=true npm test
```

## Documentation

- [Technical Design Document](docs/design.md) – System architecture, API design, data model, security considerations, and deployment strategy.

