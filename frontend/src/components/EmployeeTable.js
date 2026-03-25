import React from 'react';
import './DownloadButton'; // registers the <download-button> custom element

/**
 * EmployeeTable
 *
 * @param {object}   props
 * @param {Array}    props.employees    - List of employee objects to display.
 * @param {Function} props.onEdit       - Called with an employee when Edit is clicked.
 * @param {Function} props.onDelete     - Called with an employee when Delete is clicked.
 * @param {Function} props.onDownload   - Called when the Download CSV button is clicked.
 */
export default function EmployeeTable({ employees, onEdit, onDelete, onDownload }) {
  const downloadHostRef = React.useRef(null);

  /**
   * Attach/detach the `download-csv` event listener on the closed-shadow-root
   * host element whenever `onDownload` changes.  The cleanup function returned
   * from the effect removes the listener to prevent memory leaks.
   */
  React.useEffect(() => {
    const el = downloadHostRef.current;
    if (!el) return undefined;

    const handler = () => {
      if (typeof onDownload === 'function') {
        onDownload();
      }
    };

    el.addEventListener('download-csv', handler);
    return () => el.removeEventListener('download-csv', handler);
  }, [onDownload]);

  return (
    <div className="table-wrapper">
      {/* Download button – always rendered in the same DOM position so the
          ref and effect above remain stable across employees list changes. */}
      <div className="download-bar">
        {/* eslint-disable-next-line react/no-unknown-property */}
        <download-button id="download-btn-host" ref={downloadHostRef} />
      </div>

      {employees.length === 0 ? (
        <p className="empty-state">No employees found.</p>
      ) : (
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
      )}
    </div>
  );
}

