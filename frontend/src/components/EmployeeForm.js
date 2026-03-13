import React from 'react';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Design'];

const EMPTY_FORM = {
  name: '',
  email: '',
  department: '',
  role: '',
  hire_date: '',
};

export default function EmployeeForm({ initial, onSubmit, onCancel, error }) {
  const [form, setForm] = React.useState(initial || EMPTY_FORM);

  React.useEffect(() => {
    setForm(initial || EMPTY_FORM);
  }, [initial]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Full name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="email@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="department">Department</label>
        <select
          id="department"
          name="department"
          required
          value={form.department}
          onChange={handleChange}
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="role">Role</label>
        <input
          id="role"
          name="role"
          type="text"
          required
          value={form.role}
          onChange={handleChange}
          placeholder="Job title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="hire_date">Hire Date</label>
        <input
          id="hire_date"
          name="hire_date"
          type="date"
          required
          value={form.hire_date}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initial ? 'Update Employee' : 'Add Employee'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
