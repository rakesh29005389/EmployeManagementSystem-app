/**
 * DownloadButton Web Component
 *
 * Renders a "Download CSV" button inside a **closed** shadow root so that
 * `element.shadowRoot` returns `null` from JavaScript running in the page.
 * The host element dispatches a bubbling `download-csv` custom event when the
 * inner button is clicked, allowing React to attach a listener and trigger the
 * actual file download.
 *
 * Selenium note: because the shadow root is closed, `JavascriptExecutor` cannot
 * reach `element.shadowRoot` directly. Use Selenium 4's built-in
 * `WebElement.getShadowRoot()` which pierces shadow DOM via Chrome DevTools
 * Protocol, or use the CDP-backed `JavascriptExecutor` approach shown in the
 * accompanying Selenium Java test.
 */
class DownloadButton extends HTMLElement {
  constructor() {
    super();

    /** @type {ShadowRoot} – kept in closure, not exposed on `this.shadowRoot` */
    const shadow = this.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
      }
      button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 18px;
        background: #1a73e8;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s, opacity 0.2s;
      }
      button:hover {
        background: #1558b0;
      }
      button:active {
        opacity: 0.85;
      }
    `;

    const button = document.createElement('button');
    button.id = 'download-csv-btn';
    button.setAttribute('aria-label', 'Download employee data as CSV');
    button.textContent = '⬇ Download CSV';

    button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('download-csv', { bubbles: true, composed: true }));
    });

    shadow.appendChild(style);
    shadow.appendChild(button);
  }
}

if (!customElements.get('download-button')) {
  customElements.define('download-button', DownloadButton);
}
