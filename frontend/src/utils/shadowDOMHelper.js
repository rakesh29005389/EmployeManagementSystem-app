/**
 * shadowDOMHelper.js
 *
 * Utilities for interacting with Shadow DOM elements in the HTML DOM.
 *
 * Background
 * ----------
 * Shadow DOM encapsulates a component's internal tree so styles and scripts
 * outside cannot accidentally affect it.  There are two modes:
 *
 *   • open   — `element.shadowRoot` returns the ShadowRoot so external code
 *               can still query it (all helpers below work on open roots).
 *   • closed — `element.shadowRoot` returns `null`.  The browser intentionally
 *               blocks external access.  The built-in PDF viewer, media controls,
 *               and many browser-extension overlays use closed roots.
 *
 * Closed shadow roots cannot be reliably accessed from ordinary page JavaScript.
 * The recommended approach is to use the component's public API (events,
 * attributes, slots) instead of reaching into its shadow tree.
 *
 * If you own the component, switch `mode` from `'closed'` to `'open'` so that
 * the helpers below can traverse it freely.
 */

/**
 * Returns the first element matching `selector` inside an open shadow root.
 *
 * @param {Element} host - The shadow-host element.
 * @param {string} selector - Any valid CSS selector.
 * @returns {Element|null} The first matching element, or `null` when the shadow
 *   root is closed or no element matches.
 */
export function queryInShadowRoot(host, selector) {
  if (!host || !host.shadowRoot) return null;
  return host.shadowRoot.querySelector(selector);
}

/**
 * Returns all elements matching `selector` inside an open shadow root.
 *
 * @param {Element} host - The shadow-host element.
 * @param {string} selector - Any valid CSS selector.
 * @returns {Element[]} Array of matching elements (empty when the root is
 *   closed or no elements match).
 */
export function queryAllInShadowRoot(host, selector) {
  if (!host || !host.shadowRoot) return [];
  return Array.from(host.shadowRoot.querySelectorAll(selector));
}

/**
 * Recursively queries the full DOM tree — including every *open* shadow root —
 * for elements matching `selector`.
 *
 * Closed shadow roots are silently skipped because `element.shadowRoot`
 * returns `null` for them.
 *
 * @param {string} selector - Any valid CSS selector.
 * @param {Document|Element|ShadowRoot} [root=document] - Starting node.
 * @returns {Element[]} All matching elements found across open shadow trees.
 *
 * @example
 * // Find every <input> across the whole page including open shadow roots
 * const inputs = deepQuerySelector('input');
 */
export function deepQuerySelector(selector, root = document) {
  const results = [];

  function traverse(node) {
    node.querySelectorAll(selector).forEach((el) => results.push(el));
    node.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot) {
        traverse(el.shadowRoot);
      }
    });
  }

  traverse(root);
  return results;
}

/**
 * Attaches a MutationObserver to an *open* shadow root and calls `callback`
 * whenever child nodes or attributes change within it.
 *
 * Returns `null` silently when the shadow root is closed (inaccessible) so
 * callers do not need to special-case closed roots.
 *
 * Remember to call `observer.disconnect()` when the observation is no longer
 * needed to avoid memory leaks.
 *
 * @param {Element} host - The shadow-host element.
 * @param {MutationCallback} callback - Invoked with `(mutationList, observer)`.
 * @param {MutationObserverInit} [options] - Standard MutationObserver options.
 *   Defaults to `{ childList: true, subtree: true, attributes: true }`.
 * @returns {MutationObserver|null} The running observer, or `null` when the
 *   shadow root is closed.
 *
 * @example
 * const observer = observeShadowRoot(host, (mutations) => {
 *   mutations.forEach((m) => console.log('Shadow DOM changed', m));
 * });
 * // Later, when done:
 * observer?.disconnect();
 */
export function observeShadowRoot(host, callback, options) {
  if (!host || !host.shadowRoot) return null;

  const resolvedOptions = options || {
    childList: true,
    subtree: true,
    attributes: true,
  };

  const observer = new MutationObserver(callback);
  observer.observe(host.shadowRoot, resolvedOptions);
  return observer;
}

/**
 * Dispatches `eventName` on the shadow host so that event listeners attached
 * to the host receive it.  This is the recommended way to communicate *into*
 * a closed shadow root: design the component to listen for custom events on
 * its host element and react accordingly.
 *
 * @param {Element} host - The element that owns the shadow root.
 * @param {string} eventName - Name of the custom event (e.g. `'pdf:print'`).
 * @param {*} [detail] - Optional payload attached as `event.detail`.
 * @returns {boolean} `true` if the event was not cancelled by a listener.
 *
 * @example
 * // Ask a hypothetical PDF web component to print the current document
 * dispatchToShadowHost(pdfElement, 'pdf:print', { copies: 2 });
 */
export function dispatchToShadowHost(host, eventName, detail) {
  if (!host) return false;
  const event = new CustomEvent(eventName, {
    bubbles: true,
    composed: true, // crosses shadow boundaries
    detail,
  });
  return host.dispatchEvent(event);
}
