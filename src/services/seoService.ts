interface SeoMeta {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_DESCRIPTION =
  'Pharmaceutical-grade peptide protocols, unbroken cold-chain delivery, and turnkey clinical partner storefronts by Whole Harbor Wellness.';

const ROUTE_SEO: Record<string, SeoMeta> = {
  home: {
    title: 'Whole Harbor Wellness – Clinical Peptide Formulations',
    description:
      'Explore HPLC-verified peptide protocols, cold-chain wellness kits, and guided longevity support with Whole Harbor Wellness.'
  },
  shop: {
    title: 'Shop Formulations – Whole Harbor Wellness',
    description:
      'Browse pharmaceutical-grade metabolic, cellular, recovery, and longevity peptide formulations shipped in monitored cold-chain packaging.'
  },
  'wellness-programs': {
    title: 'Supervised Wellness Programs – Whole Harbor Wellness',
    description:
      'Discover structured metabolic reset, cellular longevity, and tissue recovery programs built for lasting holistic wellness.'
  },
  approach: {
    title: 'Clinical Approach & Standards – Whole Harbor Wellness',
    description:
      'Learn how Whole Harbor Wellness ensures >99.2% HPLC purity, sterile synthesis, and 2°C–8°C cold-chain integrity.'
  },
  learn: {
    title: 'Education Studio & Peptide Guides – Whole Harbor Wellness',
    description:
      'Read step-by-step mixing guides, cold-chain storage instructions, ordering walkthroughs, and peptide reference sheets.'
  },
  partners: {
    title: 'Partner Ecosystem Application – Whole Harbor Wellness',
    description:
      'Launch a co-branded wellness storefront, unique referral link, and transparent commission dashboard for your clinic or studio.'
  },
  'partner-portal': {
    title: 'Partner Portal & Reporting – Whole Harbor Wellness',
    description:
      'Track referred orders, manage wholesale 10-vial kit inventory, monitor commission payouts, and download QR referral assets.'
  },
  'customer-portal': {
    title: 'Client Portal & Order Tracking – Whole Harbor Wellness',
    description:
      'Manage your cold-chain orders, saved wellness protocols, shipping preferences, and account security settings.'
  },
  admin: {
    title: 'Executive Operations Center – Whole Harbor Wellness',
    description:
      'Manage partner approvals, user access roles, order fulfillment, commissions, product catalog, and CMS education content.'
  },
  about: {
    title: 'About Whole Harbor Wellness – Our Philosophy',
    description:
      'Wellness should be personal. Discover Whole Harbor Wellness, our clinical rigor, and our community studio partner network.'
  },
  faq: {
    title: 'Frequently Asked Questions – Whole Harbor Wellness',
    description:
      'Find answers on peptide reconstitution, HPLC batch testing, cold-chain shipping, member discounts, and clinic partnerships.'
  },
  contact: {
    title: 'Contact Support & Care Team – Whole Harbor Wellness',
    description:
      'Connect with Whole Harbor Wellness for product education, cold-chain tracking, CoA lab requests, or partner onboarding.'
  }
};

function upsertMeta(selector: string, attrName: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function upsertJsonLd(schema: Record<string, unknown>) {
  let script = document.getElementById('whw-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'whw-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function updatePageSeo(path: string, param?: string) {
  const base = ROUTE_SEO[path] || {
    title: 'Whole Harbor Wellness – Holistic Clinical Ecosystem',
    description: DEFAULT_DESCRIPTION
  };

  let title = base.title;
  let description = base.description;

  if (path === 'product-detail' && param) {
    const cleanName = param.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    title = `${cleanName} Formulation – Whole Harbor Wellness`;
    description = `Review clinical specifications, vial strengths, cold-chain standards, and purity verification for ${cleanName} from Whole Harbor Wellness.`;
  } else if (path === 'partner-page' && param) {
    const cleanPartner = param.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    title = `${cleanPartner} × Whole Harbor Wellness`;
    description = `Access exclusive member pricing and physician-informed peptide wellness formulations curated for ${cleanPartner}.`;
  }

  const canonicalUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;

  document.title = title;
  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Whole Harbor Wellness');
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  upsertCanonical(canonicalUrl);

  const schema: Record<string, unknown> =
    path === 'product-detail' && param
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: param.replace(/-/g, ' '),
          description,
          brand: {
            '@type': 'Brand',
            name: 'Whole Harbor Wellness'
          }
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Whole Harbor Wellness',
          url: window.location.origin,
          description: DEFAULT_DESCRIPTION,
          applicationCategory: 'HealthApplication'
        };

  upsertJsonLd(schema);
}
