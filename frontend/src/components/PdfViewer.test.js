import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PdfViewer from './PdfViewer';

describe('PdfViewer', () => {
  it('shows a placeholder when no src is provided', () => {
    render(<PdfViewer src="" />);
    expect(screen.getByText(/no document available/i)).toBeInTheDocument();
  });

  it('renders an embed element with the correct src and type', () => {
    const { container } = render(<PdfViewer src="https://example.com/doc.pdf" />);
    const embed = container.querySelector('embed');
    expect(embed).not.toBeNull();
    expect(embed.getAttribute('src')).toBe('https://example.com/doc.pdf');
    expect(embed.getAttribute('type')).toBe('application/pdf');
  });

  it('renders the document title', () => {
    render(<PdfViewer src="https://example.com/doc.pdf" title="Employee Contract" />);
    expect(screen.getByText('Employee Contract')).toBeInTheDocument();
  });

  it('renders a download link pointing to the PDF', () => {
    render(<PdfViewer src="https://example.com/doc.pdf" title="My Doc" />);
    const downloadLink = screen.getByRole('link', { name: /download my doc/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/doc.pdf');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the fallback "open in a new tab" link', () => {
    render(<PdfViewer src="https://example.com/doc.pdf" />);
    const fallbackLink = screen.getByRole('link', { name: /open it in a new tab/i });
    expect(fallbackLink).toHaveAttribute('href', 'https://example.com/doc.pdf');
  });

  it('renders a close button when onClose prop is provided', () => {
    const handleClose = jest.fn();
    render(<PdfViewer src="https://example.com/doc.pdf" onClose={handleClose} />);
    expect(screen.getByRole('button', { name: /close pdf viewer/i })).toBeInTheDocument();
  });

  it('does not render a close button when onClose is not provided', () => {
    render(<PdfViewer src="https://example.com/doc.pdf" />);
    expect(screen.queryByRole('button', { name: /close pdf viewer/i })).toBeNull();
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = jest.fn();
    render(<PdfViewer src="https://example.com/doc.pdf" onClose={handleClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close pdf viewer/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('uses the default title "PDF Document" when none is supplied', () => {
    const { container } = render(<PdfViewer src="https://example.com/doc.pdf" />);
    const embed = container.querySelector('embed');
    expect(embed.getAttribute('title')).toBe('PDF Document');
  });
});
