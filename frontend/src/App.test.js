import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch so tests don't hit actual network
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders Employee Management System heading', async () => {
  render(<App />);
  expect(screen.getByText(/Employee Management System/i)).toBeInTheDocument();
});

test('renders Add Employee button', async () => {
  render(<App />);
  expect(await screen.findByText(/\+ Add Employee/i)).toBeInTheDocument();
});

test('renders department filter', async () => {
  render(<App />);
  expect(screen.getByLabelText(/Filter by Department/i)).toBeInTheDocument();
});
