# Whole Harbor Wellness — Project Skill & Design Constitution (`skill.md`)

> Canonical engineering, UI/UX design, Firebase architecture, and codebase reference for continuing phased development of **Whole Harbor Wellness** without regressions.

---

## 1. Design System & Brand Tokens (Preserve Strictly)

All views and components adhere to an editorial clinical-luxury aesthetic defined in `src/index.css` and `index.html`.

### Color Palette
| Token | CSS Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Ivory** | `--ivory` | `#fffdfb` | Primary canvas background, cards, drawers |
| **Blush / Warm Cream** | `--blush` | `#f6f4ee` | Subtle containers, callout panels, trust strips |
| **Petal** | `--petal` | `#efe9dc` | Soft hover fills, avatar badges |
| **Deep Navy** | `--deep` / `--navy` | `#0c2340` | Primary headings, active states, primary CTA fills |
| **Harbor Gold** | `--rose` / `--gold` | `#c5a059` | Accent buttons, eyebrows, badges, borders, active highlights |
| **Ink** | `--ink` | `#111d2b` | Primary body copy |
| **Muted Slate** | `--muted` | `#5a6b7c` | Secondary copy, metadata, captions |
| **Warm Line** | `--line` | `#dfd7c7` | 1px card borders, table dividers, shell rules |

### Typography
- **Display / Serif Headings**: `'Cormorant Garamond', Georgia, serif` (`font-serif`, weight `600`/`700`, color `--deep`).
- **Body / UI Sans**: `'Manrope', sans-serif` (`font-sans`, clean tracking, tabular alignment for prices and metrics).
- **Icons**: `lucide-react` for navigation/chrome controls and `Material Symbols Outlined` inside domain badges/cards.

### Layout & Responsive Navigation Rules (Do Not Break)
- **Desktop (`>= 681px` / `md:`)**:
  - `.site-shell` CSS grid: `240px minmax(0, 1fr)` with sticky `.sidebar` (`src/components/Sidebar.tsx`), brand logo (`/images/whw-logo.png`), primary & portal links (`src/lib/navigation.ts`), cart counter badge, and Perks card.
  - `.topbar`: Desktop-only action buttons (`Search`, `Sign In`, `Sign Up`, `Contact`, `Profile`).
- **Mobile (`<= 680px` / `< md`)**:
  - `.sidebar` is hidden (`display: none`).
  - Mobile topbar renders ONLY the compact brand mark + the `.whw-btn-hamburger` button (`mobileMenuDrawer` slide-over in `src/App.tsx`), which houses `Sign In`, `Sign Up`, `Search`, and every desktop primary & portal tab.
  - **Bottom Navigation (`src/components/MobileNav.tsx`)**: Fixed bottom bar rendered outside `.site-shell` (`Shop`, `Cart` with count badge, `Perks`, `Orders`, `Learn`, plus `Admin` when `isAdmin`).
  - **Floating Assistant (`src/components/AskWHWDrawer.tsx`)**: Positioned at `bottom-[86px] right-4 md:bottom-6 md:right-6 z-30` so it never overlaps the fixed mobile bottom nav.

---

## 2. Implemented Architecture & Inventory

### Core Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`).
- **Authentication & Database**: Firebase Authentication (`GoogleAuthProvider`, Email/Password login/signup, password reset & change password, `onAuthStateChanged`, `signOut`) + Cloud Firestore (Database ID: `ai-studio-e9956964-210f-4326-bc0b-ff5590437fa4`, Project: `gen-lang-client-0634602892`).
- **Resilience**: Automatic `localStorage` fallback cache in `src/services/dbService.ts` with a fast REST reachability check (`ensureFirestoreReachable`) so the UI never hangs offline, plus root `<ErrorBoundary>` (`src/components/ErrorBoundary.tsx`).
- **SEO, QR & Security Validation**: Dynamic per-route SEO & JSON-LD (`src/services/seoService.ts`), downloadable clinic QR generation (`qrcode`), privacy-conscious event tracking (`src/services/analyticsService.ts`), `public/robots.txt` + `public/sitemap.xml`, and ESLint security rules check via `@firebase/eslint-plugin-security-rules`.

### Views Implemented (`src/views/`)
| View | Route / Hash | Purpose |
| :--- | :--- | :--- |
| `HomeView.tsx` | `#/` | Editorial hero, wellness goal cards, featured formulations, dynamic verified testimonials, synergy stacks, trust pillars |
| `ShopView.tsx` | `#/shop` | Category filter pills, live search, retail product cards, stack kits, wholesale vs. retail awareness |
| `ProductDetailView.tsx` | `#/product/:slug` | Strength selector, purity/COA metadata, clinical disclosures, educational notes, add-to-cart |
| `ProgramsView.tsx` | `#/wellness-programs` | Structured metabolic, cellular, recovery & longevity monthly programs |
| `ApproachView.tsx` | `#/approach` | Clinical sourcing, HPLC purity verification, cold-chain protocol overview |
| `PartnersView.tsx` | `#/partners` | Partner ecosystem value props, separate retail vs. partner link explanation, 15-field partner application form (`status: 'NEW'`) |
| `PartnerLandingView.tsx` | `#/partner/:slug` | Dedicated co-branded partner storefront with custom logo, category-curated formulations, VIP referral attribution (`15%` discount, `25%` partner commission), and `?src=`/`utm_source=` tracking |
| `PartnerDashboardView.tsx` | `#/partner-portal` | 7 period-filtered KPIs (including Cancelled Orders), monthly performance breakdown, approval-gated Wholesale 10-Vial Kit ordering, Orders & Earnings CSV exports, downloadable QR PNG, editable practice profile/logo/categories |
| `CustomerPortalView.tsx` | `#/customer-portal` | Client-scoped order history, cold-chain tracking numbers, saved protocols, shipping preferences & password change form |
| `AdminDashboardView.tsx` | `#/admin` | Executive Control Center: Traffic & Partner Performance Overview, Users & Roles (role, wholesale status, account status, partner linking), Partner Application Review & Category Curation, Order Filtering & Inspection Modal, Commission Payouts, Product Catalog CRUD, Programs/Articles/FAQs/Testimonials CRUD, Inquiries Inbox, Audit Logs |
| `LearnView.tsx` | `#/learn` | Dedicated Education Studio (reconstitution guide, GLP-1 nutrition, cellular protocols, Ask WHW context) |
| `AboutView.tsx` | `#/about` | Brand story, clinical governance, dynamic testimonials & persistent inquiry form |
| `FAQView.tsx` | `#/faq` | Interactive categorized FAQ accordion synced with Admin CMS |
| `ContactView.tsx` | `#/contact` | Persistent clinical concierge & support inquiry form backed by Firestore |
| `ArchitectureView.tsx` | `#/architecture` | Platform architecture & attribution documentation |

### Global Components & Contexts (`src/components/`, `src/context/`, `src/services/`, `src/lib/`)
- **State Contexts**: `AuthContext.tsx` (RBAC matrix `ROLE_PERMISSIONS`, Google + Email/Password auth, password reset/change, suspended account guard, seeded quick-demo accounts switcher, `onAuthStateChanged` sync to `/users/{uid}`), `CartContext.tsx` (cart drawer state, volume discounts, partner referral & UTM `?src=` attribution, shipping/tax math).
- **Modals & Drawers**: `AuthModal.tsx`, `CartDrawer.tsx`, `CheckoutModal.tsx`, `SearchModal.tsx`, `GoalsModal.tsx`, `PerksModal.tsx`, `AskWHWDrawer.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `Footer.tsx`, `ErrorBoundary.tsx`.
- **Database Service (`src/services/dbService.ts`)**: Full CRUD + seeding + audit logging across:
  - `users`, `partners`, `products`, `orders`, `partner_earnings`, `wellness_programs`, `educational_articles`, `faqs`, `testimonials`, `inquiries`, `analytics_events`, `audit_logs`.
  - **Scoped Queries**: `getOrders('admin' | 'partner' | 'customer')`, `getMyPartnerApplications()`, `getPartnerEarnings()`, `getPartners(includeUnapproved)`, `getInquiries()`, and `getUsers()` align with Firestore `firestore.rules` constraints (`customerUid`, `partnerOwnerUid`, `ownerUid`, `userId`, `status == 'APPROVED'`, `uid`, and admin bypass).
- **Static & Config Data**: `whwCatalog.ts`, `seedData.ts`, `testVariables.ts`, `navigation.ts`, `firebase-blueprint.json`, `firestore.rules`.

---

## 3. Non-Negotiable Engineering Guardrails

1. **No `window.alert` / `window.open`**: Always use inline error/confirmation banners or copy-state buttons (`CheckoutModal`, `PartnerDashboardView`, `PartnersView` follow this rule).
2. **Firestore Security Alignment**:
   - Never run an unscoped `collection(db, 'orders')` or `collection(db, 'partner_earnings')` query for non-admin users. Always pass `'customer'` in `CustomerPortalView` and `'partner'` in `PartnerDashboardView`.
   - When modifying `firestore.rules`, always run `npx eslint firestore.rules` cleanly before deploying rules via `rpc_action(service_name: "fax", method_name: "DeployRules")`.
3. **Admin & Role Access**:
   - Bootstrapped admins in `firestore.rules` and `dbService.ts`: `muchuimalcolm423@gmail.com` and `admin@wholeharborwellness.com`.
4. **Verification Gate**: After every phase or feature batch, verify with:
   - `npm run lint` (`tsc --noEmit`)
   - `npm run build` (`vite build`)
   - `npx eslint firestore.rules` (if rules changed)
   - Restart dev server on port `3000` (`npm run dev`).
