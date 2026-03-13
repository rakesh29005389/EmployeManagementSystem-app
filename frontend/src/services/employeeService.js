const API_BASE = '/api/employees';

export async function getEmployees(department = '') {
  const url = department ? `${API_BASE}?department=${encodeURIComponent(department)}` : API_BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function getEmployee(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch employee');
  return res.json();
}

export async function createEmployee(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to create employee');
  return body;
}

export async function updateEmployee(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Failed to update employee');
  return body;
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Failed to delete employee');
  }
}
