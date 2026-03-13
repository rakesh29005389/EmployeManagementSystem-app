import React from 'react';

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return <p className="empty-state">No employees found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Hire Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              <td>{emp.role}</td>
              <td>{emp.hire_date}</td>
              <td className="actions-cell">
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => onEdit(emp)}
                  aria-label={`Edit ${emp.name}`}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(emp)}
                  aria-label={`Delete ${emp.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
