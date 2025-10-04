/**
 * Global test setup for Jest/JSDOM.
 * - Ensure window.location.protocol is mutable for tests that toggle https/http checks.
 * - Polyfill Response if not present (older environments).
 */
if (typeof window !== 'undefined') {
  try {
    const current = window.location;
    Object.defineProperty(window, 'location', { value: { ...current, protocol: current?.protocol || 'http:' }, writable: true });
  } catch {
    // ignore if defineProperty fails in this environment
  }
}

if (typeof Response === 'undefined') {
  // Minimal Response polyfill for tests
  global.Response = class {
    constructor(body = '{}', init = { status: 200, headers: {} }) {
      this._body = body;
      this.status = init.status || 200;
      this._headers = init.headers || {};
    }
    json() {
      return Promise.resolve(JSON.parse(this._body));
    }
    text() {
      return Promise.resolve(String(this._body));
    }
    headers = {
      get: (k) => {
        const v = this._headers && Object.keys(this._headers).find((h) => h.toLowerCase() === String(k).toLowerCase());
        return v ? this._headers[v] : null;
      }
    };
    get ok() {
      return this.status >= 200 && this.status < 300;
    }
  };
}
