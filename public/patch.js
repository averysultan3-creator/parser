(() => {
  const isPages = window.location.hostname.endsWith('github.io');
  if (!isPages) return;

  const nativeFetch = window.fetch.bind(window);
  const BACKEND_CACHE_TTL_MS = 15_000;
  const storageGetItem = Storage.prototype.getItem;
  const storageSetItem = Storage.prototype.setItem;
  let backendPromise = null;
  let cachedBackend = '';
  let cachedBackendAt = 0;

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

  function invalidateBackendBase() {
    cachedBackend = '';
    cachedBackendAt = 0;
    backendPromise = null;
  }

  window.__parserRefreshBackendBase = invalidateBackendBase;

  async function getBackendBase(forceRefresh = false) {
    const age = Date.now() - cachedBackendAt;
    if (!forceRefresh && cachedBackend && age < BACKEND_CACHE_TTL_MS) {
      return cachedBackend;
    }

    if (!backendPromise || forceRefresh) {
      backendPromise = resolveBackendBase().then((base) => {
        cachedBackend = base;
        cachedBackendAt = Date.now();
        backendPromise = null;
        return base;
      });
    }

    return backendPromise;
  }

  async function fetchApiTarget(target, init) {
    const base = await getBackendBase(false);
    if (!base) return nativeFetch(target, init);

    try {
      const response = await nativeFetch(`${base}${target}`, init);
      if (response.ok) return response;
      if (![502, 503, 504, 521, 522, 523, 524].includes(response.status)) {
        return response;
      }
    } catch (error) {
      // retry below
    }

    invalidateBackendBase();
    const refreshed = await getBackendBase(true);
    if (refreshed) {
      return nativeFetch(`${refreshed}${target}`, init);
    }

    return nativeFetch(target, init);
  }

  window.fetch = async (input, init = {}) => {
    const target = typeof input === 'string' ? input : String(input?.url || '');
    if (target.startsWith('/api/')) {
      return fetchApiTarget(target, init);
    }
    return nativeFetch(input, init);
  };
})();
