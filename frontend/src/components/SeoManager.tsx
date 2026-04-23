import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Saguaro Strikers';
const SITE_URL = 'https://www.saguarostrikers.org';
const DEFAULT_IMAGE = `${SITE_URL}/images/logo/Logo.png`;

const PRIMARY_KEYWORDS = [
  'Saguaro',
  'Rocketry',
  'Rocketry in Arizona',
  'Rocketry in Phoenix',
  'Rocketry in Scottsdale',
  'Rocketry near me',
  'Rocketry club',
  'American Rocketry Challenge',
  'Robotics club',
  'Robotics near me',
];

type SeoConfig = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  noindex?: boolean;
  schema?: Record<string, unknown>;
};

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, payload: Record<string, unknown>): void {
  let el = document.head.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-id', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

function buildSeo(pathname: string): SeoConfig {
  const normalized = pathname.toLowerCase();

  const baseConfig: SeoConfig = {
    title: `${SITE_NAME} - Rocketry & Robotics Club in Arizona`,
    description:
      'Saguaro Strikers is a student-focused rocketry and robotics club in Arizona with missions, STEM events, and American Rocketry Challenge participation.',
    keywords: PRIMARY_KEYWORDS,
    canonicalPath: pathname || '/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
      sameAs: [SITE_URL],
    },
  };

  if (normalized === '/' || normalized === '/home') {
    return baseConfig;
  }

  if (normalized === '/missions') {
    return {
      ...baseConfig,
      title: `Rocketry Missions | ${SITE_NAME}`,
      description:
        'Explore Saguaro Strikers missions including American Rocketry Challenge and student STEM projects in Arizona.',
      canonicalPath: '/missions',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Rocketry Missions',
        url: `${SITE_URL}/missions`,
      },
    };
  }

  if (normalized.startsWith('/missions/')) {
    return {
      ...baseConfig,
      title: `Mission Details | ${SITE_NAME}`,
      description:
        'View mission details, schedules, scientists, artifacts, and gallery updates for Saguaro Strikers STEM missions.',
      canonicalPath: pathname,
    };
  }

  if (normalized === '/calendar' || normalized === '/mission-calendar') {
    return {
      ...baseConfig,
      title: `STEM Events Calendar | ${SITE_NAME}`,
      description:
        'See upcoming rocketry, robotics, and STEM events from Saguaro Strikers in Arizona.',
      canonicalPath: '/calendar',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Saguaro Strikers Calendar',
        url: `${SITE_URL}/calendar`,
      },
    };
  }

  if (normalized === '/join-mission') {
    return {
      ...baseConfig,
      title: `Join a Mission | ${SITE_NAME}`,
      description:
        'Apply to join a Saguaro Strikers mission and participate in Arizona rocketry and robotics programs.',
      canonicalPath: '/join-mission',
    };
  }

  if (normalized === '/contact') {
    return {
      ...baseConfig,
      title: `Contact ${SITE_NAME}`,
      description:
        'Contact Saguaro Strikers for mission details, robotics and rocketry programs, and STEM opportunities in Arizona.',
      canonicalPath: '/contact',
    };
  }

  if (normalized.startsWith('/admin') || normalized === '/login' || normalized === '/register' || normalized.startsWith('/my-') || normalized === '/profile' || normalized === '/dashboard') {
    return {
      ...baseConfig,
      title: `${SITE_NAME}`,
      description: baseConfig.description,
      canonicalPath: pathname,
      noindex: true,
    };
  }

  return {
    ...baseConfig,
    title: `${SITE_NAME} - Rocketry & Robotics`,
    canonicalPath: pathname,
  };
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const seo = buildSeo(location.pathname);
    const canonicalUrl = `${SITE_URL}${seo.canonicalPath === '/' ? '' : seo.canonicalPath}`;

    document.title = seo.title;

    upsertMeta('meta[name="description"]', 'name', 'description', seo.description);
    upsertMeta('meta[name="keywords"]', 'name', 'keywords', seo.keywords.join(', '));
    upsertMeta('meta[name="robots"]', 'name', 'robots', seo.noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', DEFAULT_IMAGE);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_IMAGE);

    upsertCanonical(canonicalUrl);

    upsertJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
    });

    upsertJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/missions`,
        'query-input': 'required name=search_term_string',
      },
    });

    if (seo.schema) {
      upsertJsonLd('page', seo.schema);
    }
  }, [location.pathname]);

  return null;
}
