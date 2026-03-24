import React from 'react';

/**
 * PdfViewer
 *
 * Renders a PDF document inside the browser using an `<embed>` element.
 *
 * Why `<embed>` and not direct shadow-root access?
 * ------------------------------------------------
 * When the browser renders a PDF it creates an internal viewer component
 * behind a *closed* shadow root (`#shadow-root (closed)`).  External
 * JavaScript cannot access those internals — `element.shadowRoot` returns
 * `null` for closed roots by design.
 *
 * Using `<embed type="application/pdf">` we delegate rendering entirely to
 * the browser without needing to pierce its closed shadow root.  A fallback
 * download link is shown for environments that do not support inline PDF
 * rendering (e.g. mobile Safari).
 *
 * @param {Object}  props
 * @param {string}  props.src          - URL of the PDF document.
 * @param {string}  [props.title]      - Accessible label (default: 'PDF Document').
 * @param {string}  [props.width]      - CSS width  (default: '100%').
 * @param {string}  [props.height]     - CSS height (default: '600px').
 * @param {Function} [props.onClose]   - Called when the viewer close button is clicked.
 */
export default function PdfViewer({ src, title = 'PDF Document', width = '100%', height = '600px', onClose }) {
  if (!src) {
    return <p className="empty-state">No document available.</p>;
  }

  return (
    <div className="pdf-viewer-wrapper" style={{ width }} aria-label={title}>
      <div className="pdf-viewer-toolbar">
        <span className="pdf-viewer-title">{title}</span>
        <div className="pdf-viewer-actions">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-secondary"
            aria-label={`Download ${title}`}
          >
            Download
          </a>
          {onClose && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onClose}
              aria-label="Close PDF viewer"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/*
        The <embed> element asks the browser to render the PDF using its
        built-in viewer.  The viewer lives inside a closed shadow root that
        we cannot (and do not need to) access.
      */}
      <embed
        src={src}
        type="application/pdf"
        width="100%"
        height={height}
        title={title}
        aria-label={title}
        className="pdf-embed"
      />

      <p className="pdf-fallback">
        If the PDF does not display,{' '}
        <a href={src} target="_blank" rel="noopener noreferrer">
          open it in a new tab
        </a>
        .
      </p>
    </div>
  );
}
