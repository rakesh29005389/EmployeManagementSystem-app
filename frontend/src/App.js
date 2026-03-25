import React from 'react';
import './App.css';
import EmployeeTable from './components/EmployeeTable';
import EmployeeForm from './components/EmployeeForm';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './services/employeeService';

const DEPARTMENTS = ['', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Design'];

function App() {
  const [employees, setEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState('');
  const [formError, setFormError] = React.useState('');

  // 'list' | 'add' | 'edit'
  const [view, setView] = React.useState('list');
  const [editingEmployee, setEditingEmployee] = React.useState(null);

  const [filterDept, setFilterDept] = React.useState('');

  const loadEmployees = React.useCallback(async (dept) => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getEmployees(dept);
      setEmployees(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadEmployees(filterDept);
  }, [loadEmployees, filterDept]);

  function handleFilterChange(e) {
    setFilterDept(e.target.value);
  }

  function handleAddClick() {
    setEditingEmployee(null);
    setFormError('');
    setView('add');
  }

  function handleEditClick(emp) {
    setEditingEmployee(emp);
    setFormError('');
    setView('edit');
  }

  async function handleDeleteClick(emp) {
    if (!window.confirm(`Delete ${emp.name}?`)) return;
    try {
      await deleteEmployee(emp.id);
      await loadEmployees(filterDept);
    } catch (err) {
      setFetchError(err.message);
    }
  }

  async function handleFormSubmit(data) {
    setFormError('');
    try {
      if (view === 'edit') {
        await updateEmployee(editingEmployee.id, data);
      } else {
        await createEmployee(data);
      }
      setView('list');
      await loadEmployees(filterDept);
    } catch (err) {
      setFormError(err.message);
    }
  }

  function handleFormCancel() {
    setView('list');
    setFormError('');
  }

  /**
   * Converts the current employee list to CSV and triggers a browser download.
   * The download button lives inside a closed shadow root; this handler is called
   * when the `download-csv` CustomEvent bubbles up from the Web Component.
   */
  function handleDownload() {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Hire Date'];
    const rows = employees.map((emp) => [
      emp.id,
      emp.name,
      emp.email,
      emp.department,
      emp.role,
      emp.hire_date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Employee Management System</h1>
      </header>

      <main className="app-main">
        {view === 'list' ? (
          <>
            <div className="toolbar">
              <div className="filter-group">
                <label htmlFor="dept-filter">Filter by Department:</label>
                <select id="dept-filter" value={filterDept} onChange={handleFilterChange}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d || 'All Departments'}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleAddClick}>
                + Add Employee
              </button>
            </div>

            {fetchError && <div className="alert alert-error">{fetchError}</div>}

            {loading ? (
              <p className="loading">Loading employees...</p>
            ) : (
              <EmployeeTable
                employees={employees}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onDownload={handleDownload}
              />
            )}
          </>
        ) : (
          <div className="form-container">
            <h2>{view === 'edit' ? 'Edit Employee' : 'Add Employee'}</h2>
            <EmployeeForm
              initial={editingEmployee}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              error={formError}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
