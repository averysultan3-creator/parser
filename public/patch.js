(() => {
  const isPages = window.location.hostname.endsWith('github.io');
  if (!isPages) return;

  const nativeFetch = window.fetch.bind(window);
  const storageGetItem = Storage.prototype.getItem;
  const storageSetItem = Storage.prototype.setItem;

  Storage.prototype.getItem = function (key) {
    if (key === 'parserApiBase') return null;
    return storageGetItem.call(this, key);
  };

  Storage.prototype.setItem = function (key, value) {
    if (key === 'parserApiBase') return;
    return storageSetItem.call(this, key, value);
  };

  function normalizeApiBase(value) {
    if (!value) return '';
    let cleaned = String(value).trim().replace(/\/+$/, '');
    if (!cleaned) return '';
    if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
    return cleaned;
  }

  function rewriteApiUrl(input, base) {
    const target = typeof input === 'string' ? input : String(input?.url || '');
    if (!target) return input;
    if (/^https?:\/\//i.test(target)) return input;
    if (!target.startsWith('/api/')) return input;
    return `${base}${target}`;
  }

  let backendPromise = null;

  async function resolveBackendBase() {
    try {
      const fromQuery = normalizeApiBase(new URLSearchParams(window.location.search).get('api'));
      if (fromQuery) return fromQuery;
    } catch {}

    try {
      const response = await nativeFetch(`tunnel.json?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const base = normalizeApiBase(data.api || data.url || '');
        if (base) return base;
      }
    } catch {}

    return '';
  }

  async function getBackendBase() {
    if (!backendPromise) backendPromise = resolveBackendBase();
    return backendPromise;
  }

  window.fetch = async (input, init = {}) => {
    const target = typeof input === 'string' ? input : String(input?.url || '');
    if (target.startsWith('/api/')) {
      const base = await getBackendBase();
      if (base) {
        return nativeFetch(`${base}${target}`, init);
      }
    }
    return nativeFetch(input, init);
  };
})();
