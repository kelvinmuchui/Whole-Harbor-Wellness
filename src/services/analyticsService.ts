import { dbService } from './dbService.ts';
import { AnalyticsEvent } from '../types/index.ts';

const safeTrack = (payload: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
  dbService.logAnalyticsEvent(payload).catch(() => {});
};

export const analyticsService = {
  trackPageView(path: string, param?: string) {
    safeTrack({
      eventType: 'page_view',
      path: param ? `#/${path}/${param}` : `#/${path}`,
      label: path
    });
  },

  trackProductView(slug: string, name: string) {
    safeTrack({
      eventType: 'product_view',
      path: `#/product/${slug}`,
      label: name
    });
  },

  trackPartnerVisit(slug: string, partnerName: string, source?: string) {
    safeTrack({
      eventType: 'partner_visit',
      path: `#/partner/${slug}`,
      partnerSlug: slug,
      label: source ? `${partnerName} (${source})` : partnerName
    });
  },

  trackAddToCart(productName: string, value: number, partnerSlug?: string) {
    safeTrack({
      eventType: 'add_to_cart',
      path: window.location.hash || '#/shop',
      label: productName,
      partnerSlug,
      value
    });
  },

  trackCheckoutCompleted(orderNumber: string, value: number, partnerSlug?: string) {
    safeTrack({
      eventType: 'checkout_completed',
      path: '#/customer-portal',
      label: orderNumber,
      partnerSlug,
      value
    });
  },

  async getSummary() {
    const events = await dbService.getAnalyticsEvents();
    const pageViews = events.filter(e => e.eventType === 'page_view').length;
    const productViews = events.filter(e => e.eventType === 'product_view').length;
    const partnerVisits = events.filter(e => e.eventType === 'partner_visit').length;
    const addToCarts = events.filter(e => e.eventType === 'add_to_cart').length;
    const checkouts = events.filter(e => e.eventType === 'checkout_completed').length;
    return {
      totalEvents: events.length,
      pageViews,
      productViews,
      partnerVisits,
      addToCarts,
      checkouts,
      recentEvents: events.slice(0, 12)
    };
  }
};

export default analyticsService;
