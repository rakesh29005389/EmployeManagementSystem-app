import {
  queryInShadowRoot,
  queryAllInShadowRoot,
  deepQuerySelector,
  observeShadowRoot,
  dispatchToShadowHost,
} from './shadowDOMHelper';

// ---------------------------------------------------------------------------
// Helpers to create shadow hosts in tests
// ---------------------------------------------------------------------------

/**
 * Creates a <div> host with an OPEN shadow root containing the given HTML.
 */
function makeOpenHost(innerHtml = '') {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = innerHtml;
  return host;
}

/**
 * Creates a <div> host with a CLOSED shadow root.
 * The shadow root reference is returned separately because `host.shadowRoot`
 * will be `null` for closed roots.
 */
function makeClosedHost(innerHtml = '') {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = innerHtml;
  return { host, shadow };
}

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// queryInShadowRoot
// ---------------------------------------------------------------------------
describe('queryInShadowRoot', () => {
  it('returns the matching element from an open shadow root', () => {
    const host = makeOpenHost('<span id="inner">hello</span>');
    const el = queryInShadowRoot(host, '#inner');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('hello');
  });

  it('returns null when the selector does not match', () => {
    const host = makeOpenHost('<span>hello</span>');
    expect(queryInShadowRoot(host, '.missing')).toBeNull();
  });

  it('returns null for a closed shadow root because shadowRoot is null', () => {
    const { host } = makeClosedHost('<span id="inner">secret</span>');
    // host.shadowRoot === null for closed roots — cannot be accessed externally
    expect(queryInShadowRoot(host, '#inner')).toBeNull();
  });

  it('returns null when host is null', () => {
    expect(queryInShadowRoot(null, 'span')).toBeNull();
  });

  it('returns null when host has no shadow root', () => {
    const plain = document.createElement('div');
    expect(queryInShadowRoot(plain, 'span')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// queryAllInShadowRoot
// ---------------------------------------------------------------------------
describe('queryAllInShadowRoot', () => {
  it('returns all matching elements from an open shadow root', () => {
    const host = makeOpenHost('<li>a</li><li>b</li><li>c</li>');
    const items = queryAllInShadowRoot(host, 'li');
    expect(items).toHaveLength(3);
  });

  it('returns an empty array for a closed shadow root', () => {
    const { host } = makeClosedHost('<li>secret</li>');
    expect(queryAllInShadowRoot(host, 'li')).toEqual([]);
  });

  it('returns an empty array when host is null', () => {
    expect(queryAllInShadowRoot(null, 'li')).toEqual([]);
  });

  it('returns an empty array when no elements match', () => {
    const host = makeOpenHost('<span>hello</span>');
    expect(queryAllInShadowRoot(host, 'li')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// deepQuerySelector
// ---------------------------------------------------------------------------
describe('deepQuerySelector', () => {
  it('finds elements in the regular DOM', () => {
    document.body.innerHTML = '<p class="x">one</p><p class="x">two</p>';
    const results = deepQuerySelector('.x');
    expect(results).toHaveLength(2);
  });

  it('finds elements inside open shadow roots', () => {
    const host = makeOpenHost('<button class="shadow-btn">Click</button>');
    const results = deepQuerySelector('.shadow-btn');
    expect(results).toHaveLength(1);
    expect(results[0].textContent).toBe('Click');
  });

  it('does not reach inside closed shadow roots', () => {
    makeClosedHost('<button class="shadow-btn">Secret</button>');
    // Even though the button exists, deepQuerySelector cannot traverse
    // the closed shadow root — the result is empty.
    const results = deepQuerySelector('.shadow-btn');
    expect(results).toHaveLength(0);
  });

  it('accepts a custom root element', () => {
    const container = document.createElement('section');
    container.innerHTML = '<p class="y">found</p>';
    document.body.appendChild(container);

    document.body.innerHTML += '<p class="y">outside</p>';

    const results = deepQuerySelector('.y', container);
    expect(results).toHaveLength(1);
    expect(results[0].textContent).toBe('found');
  });
});

// ---------------------------------------------------------------------------
// observeShadowRoot
// ---------------------------------------------------------------------------
describe('observeShadowRoot', () => {
  it('returns a MutationObserver for an open shadow root and fires on change', async () => {
    const host = makeOpenHost('<div id="target"></div>');
    const callback = jest.fn();
    const observer = observeShadowRoot(host, callback);

    expect(observer).toBeInstanceOf(MutationObserver);

    // Trigger a mutation inside the shadow root and wait for the microtask queue
    host.shadowRoot.querySelector('#target').textContent = 'changed';
    await Promise.resolve();

    expect(callback).toHaveBeenCalled();

    observer.disconnect();
  });

  it('returns null for a closed shadow root', () => {
    const { host } = makeClosedHost('<div></div>');
    const callback = jest.fn();
    expect(observeShadowRoot(host, callback)).toBeNull();
  });

  it('returns null when host is null', () => {
    expect(observeShadowRoot(null, jest.fn())).toBeNull();
  });

  it('accepts custom MutationObserver options', () => {
    const host = makeOpenHost('<div></div>');
    const callback = jest.fn();
    const options = { childList: true, subtree: false, attributes: false };

    const spy = jest.spyOn(MutationObserver.prototype, 'observe');
    const observer = observeShadowRoot(host, callback, options);

    expect(spy).toHaveBeenCalledWith(host.shadowRoot, options);
    observer.disconnect();
  });
});

// ---------------------------------------------------------------------------
// dispatchToShadowHost
// ---------------------------------------------------------------------------
describe('dispatchToShadowHost', () => {
  it('dispatches a custom event on the host element', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const listener = jest.fn();
    host.addEventListener('pdf:print', listener);

    const result = dispatchToShadowHost(host, 'pdf:print', { copies: 2 });

    expect(result).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ copies: 2 });
  });

  it('dispatches events with composed: true so they cross shadow boundaries', () => {
    const host = makeOpenHost('');
    const listener = jest.fn();
    host.addEventListener('my:event', listener);

    dispatchToShadowHost(host, 'my:event');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].composed).toBe(true);
  });

  it('returns false when host is null', () => {
    expect(dispatchToShadowHost(null, 'some:event')).toBe(false);
  });
});
