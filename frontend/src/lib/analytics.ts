const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-FWVSF87TM3';
const GA_ENABLED = import.meta.env.VITE_GA4_ENABLED !== 'false';

export const isAnalyticsConfigured = Boolean(GA_MEASUREMENT_ID) && GA_ENABLED;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __ga4Initialized?: boolean;
  }
}

function ensureGtagScriptLoaded(measurementId: string) {
  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`
  );

  if (existingScript) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (!isAnalyticsConfigured || window.__ga4Initialized) return;

  ensureGtagScriptLoaded(GA_MEASUREMENT_ID);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  // Disable auto page_view to prevent duplicates in SPA navigation.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  window.__ga4Initialized = true;
}

export function trackPageView(path: string) {
  if (!isAnalyticsConfigured || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (!isAnalyticsConfigured || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

function normalizeText(text: string | null | undefined) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function setupAutoAnalyticsTracking() {
  if (!isAnalyticsConfigured) return () => {};

  const clickHandler = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement | null;
    if (!target) return;

    const clickable = target.closest('a,button') as HTMLAnchorElement | HTMLButtonElement | null;
    if (!clickable) return;
    if (clickable.getAttribute('data-analytics-ignore') === 'true') return;

    const tagName = clickable.tagName.toLowerCase();
    const label = normalizeText(clickable.textContent);
    const href = tagName === 'a' ? (clickable as HTMLAnchorElement).getAttribute('href') ?? '' : '';

    trackEvent('ui_click', {
      element_type: tagName,
      element_label: label || 'unlabeled',
      link_url: href || undefined,
      page_path: `${window.location.pathname}${window.location.search}`,
    });
  };

  const submitHandler = (evt: Event) => {
    const form = evt.target as HTMLFormElement | null;
    if (!form || form.tagName.toLowerCase() !== 'form') return;
    if (form.getAttribute('data-analytics-ignore') === 'true') return;

    trackEvent('form_submit', {
      form_name: normalizeText(form.getAttribute('name')) || normalizeText(form.getAttribute('id')) || 'unnamed_form',
      page_path: `${window.location.pathname}${window.location.search}`,
    });
  };

  document.addEventListener('click', clickHandler, { capture: true });
  document.addEventListener('submit', submitHandler, { capture: true });

  return () => {
    document.removeEventListener('click', clickHandler, { capture: true });
    document.removeEventListener('submit', submitHandler, { capture: true });
  };
}

