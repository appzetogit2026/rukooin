/**
 * Detect if the app is running inside a WebView (Flutter wrapper)
 * vs. a regular browser.
 *
 * Detection order:
 *  1. If ?source=app is in the URL on first load → mark as app mode and persist
 *  2. Android WebView User-Agent pattern (includes "wv" or no Chrome but has WebKit)
 *  3. iOS WebView (has AppleWebKit but NO Safari label)
 */

const APP_MODE_KEY = '__rukkoo_app_mode__';

// Call once at startup to persist URL param to localStorage
export const initAppMode = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('source') === 'app') {
    localStorage.setItem(APP_MODE_KEY, '1');
  }
};

export const isWebView = () => {
  // Stored flag (set from URL param on first load)
  if (localStorage.getItem(APP_MODE_KEY) === '1') return true;

  const ua = navigator.userAgent || '';

  // Android WebView: User-Agent contains "wv" flag
  const isAndroidWebView = /Android/.test(ua) && /wv/.test(ua);

  // Android WebView alternate: no Chrome UA but has WebKit + Android
  const isAndroidWebViewAlt = /Android/.test(ua) && /Version\/\d/.test(ua) && !/Chrome/.test(ua);

  // iOS WebView: has AppleWebKit but NOT Safari (Safari label only present in real browser)
  const isIOSWebView = /(iPhone|iPad|iPod)/.test(ua) && /AppleWebKit/.test(ua) && !/Safari/.test(ua);

  return isAndroidWebView || isAndroidWebViewAlt || isIOSWebView;
};
