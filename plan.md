# Whole Harbor Wellness — Phased Development Plan (`plan.md`)

> Structured execution roadmap aligned with **Official Quotation QT-2026-048** (Kingstech Digital Agency for Whole Harbor Wellness • Total Contract Scope: **Ksh 100,000.00**).
> Every phase builds on the existing design system (`skill.md`) and advances remaining production hardening without altering established UI aesthetics or mobile navigation behavior.

---

## Contract Scope Summary (`QT-2026-048`)

| Phase | Quotation Module | Amount (KES) | Current Status |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Module 1 – Public Website & UI/UX Development | Ksh 30,000.00 | **Completed** (Dynamic Testimonials + Persistent Inquiries + All Public Views) |
| **Phase 2** | Module 2 – User Authentication & Access Control | Ksh 15,000.00 | **Completed** (Google & Email/Password Auth, Password Reset/Change, RBAC Guards) |
| **Phase 3** | Module 3 – Partner Management Module *(Core MVP)* | Ksh 15,000.00 | **Completed** (Application Intake, `WH-P-XXXXXX`, Approval-to-User Sync, Editable Profile) |
| **Phase 4** | Module 4 – Partner Landing Pages & Referral Links | Ksh 12,000.00 | **Completed** (Custom Logo, Curated Categories, `?src=`/`utm_source=` Attribution, QR PNG Export) |
| **Phase 5** | Module 5 – Sales & Order Tracking | Ksh 5,000.00 | **Completed** (Order Status/Channel/Date Filters, Attribution Audit, Order Inspection Modal) |
| **Phase 6** | Module 6 – Partner Dashboard | Ksh 10,000.00 | **Completed** (Working Date Filter, Cancelled KPI, Monthly Summary, Orders & Earnings CSV, QR Assets) |
| **Phase 7** | Module 7 – Admin Dashboard | Ksh 10,000.00 | **Completed** (Full Programs/Articles/FAQs/Testimonials CRUD, Inquiries Inbox, User Status/Partner Linking, Partner Performance Table) |
| **Phase 8** | Module 8 – Security, SEO & Analytics | Ksh 3,000.00 | **Completed** (Deployed `firestore.rules`, Dynamic Route SEO + JSON-LD, `robots.txt`/`sitemap.xml`, Privacy-First Analytics Service) |

---

## Completed Implementation Record (`QT-2026-048`)

### Phase 1 — Public Website & UI/UX Refinement *(Ksh 30,000 • Complete)*
- Editorial clinical-luxury design system (`#fffdfb`, `#0c2340`, `#c5a059`, `Cormorant Garamond` + `Manrope`), desktop sidebar + mobile hamburger drawer + fixed 5-tab `MobileNav.tsx`.
- Persistent concierge/contact form submissions in `ContactView.tsx` and `AboutView.tsx` backed by `dbService.createInquiry()` (`/inquiries/{inquiryId}`).
- Dynamic verified testimonials in `HomeView.tsx` and `AboutView.tsx` synced with Admin CMS via `dbService.getTestimonials()`.

### Phase 2 — Production Authentication & Password Management *(Ksh 15,000 • Complete)*
- Firebase Google Sign-In (`signInWithPopup`) plus Firebase Email/Password registration & login (`createUserWithEmailAndPassword` / `signInWithEmailAndPassword` with local fallback if Email/Password provider is toggled off).
- `"Forgot Password?"` reset email flow (`sendPasswordResetEmail`) in `AuthModal.tsx` and **Change Password** security panel (`reauthenticateWithCredential` + `updatePassword`) in `CustomerPortalView.tsx`.
- Role-gated route guards in `src/App.tsx` for `#/partner-portal`, `#/customer-portal`, and `#/admin` plus `SUSPENDED` account enforcement.

### Phase 3 — Partner Management Module *(Ksh 15,000 • Complete)*
- Sequential `WH-P-XXXXXX` Partner ID generation, 15-field intake (`PartnersView.tsx`), and 6-state Admin review workflow (`NEW`, `UNDER REVIEW`, `APPROVED`, `NEEDS INFORMATION`, `DECLINED`, `SUSPENDED`).
- Automatic owner `/users/{uid}` sync (`wholesaleApprovalStatus`, `partnerId`, `partnerSlug`, `role`) when an Admin transitions partner approval status.
- Authenticated pending partner visibility (`getMyPartnerApplications()`) and editable Practice Profile inside `PartnerDashboardView.tsx`.

### Phase 4 — Partner Landing Pages, Logos & Referral Attribution *(Ksh 12,000 • Complete)*
- Custom partner logo upload/URL preview + partner-specific wellness category curation (`metabolic`, `cellular`, `recovery`, `longevity`, `stacks`) configurable by both Partner Profile & Admin Partner Review Modal.
- `PartnerLandingView.tsx` renders partner branding logo, curated specialty badges, category-filtered featured formulations, and tracks partner visits.
- Downloadable PNG QR Code generator (`qrcode` library) for `#/partner/:slug` and `?src=` / `?utm_source=` referral source capture into `CartContext` and `CheckoutModal` orders.

### Phase 5 — Sales & Order Tracking *(Ksh 5,000 • Complete)*
- Status (`PENDING`, `CONFIRMED`, `PROCESSING`, `COMPLETED`, `CANCELLED`), Channel (`PARTNER` vs `DIRECT`), and Date (`Current Month`, `Previous Month`, `YTD`, `All`) filtering in `AdminDashboardView.tsx`.
- Full **Order Detail Inspection Modal** displaying customer, shipping address, line items, referral source attribution, commission breakdown, cold-chain tracking, and live status selector.

### Phase 6 — Partner Dashboard Reporting & Controls *(Ksh 10,000 • Complete)*
- Active `dateFilter` driving all 7 KPI cards (including **Cancelled Orders**), monthly breakdown summary cards, Orders table, and Earnings Ledger.
- Separate **Orders CSV** and **Earnings CSV** exports alongside live Partner Account switcher and approval-gated Wholesale 10-Vial Kit ordering.

### Phase 7 — Admin Dashboard Full Operations *(Ksh 10,000 • Complete)*
- Full Create / Edit / Delete CRUD in `AdminDashboardView.tsx` for **Wellness Programs**, **Educational Articles**, **FAQs**, and **Testimonials**, plus **Inquiries Inbox** (`NEW` → `IN_PROGRESS` → `RESOLVED`).
- **Users & Roles** extended with account status toggle (`ACTIVE`, `SUSPENDED`, `INACTIVE`, `PENDING_VERIFICATION`) and partner link assignment.
- **Partner Performance Overview** comparison table tracking completion rate, gross sales, and pending vs. paid commissions per clinic.

### Phase 8 — Security, SEO & Analytics *(Ksh 3,000 • Complete)*
- Deployed `firestore.rules` audited cleanly with `npx eslint firestore.rules` (`@firebase/eslint-plugin-security-rules`) and synchronized with `firebase-blueprint.json`.
- Dynamic per-route `<title>`, `<meta name="description">`, OpenGraph/Twitter tags, `<link rel="canonical">`, and Schema.org `Organization`/`Product` JSON-LD in `src/services/seoService.ts`, plus `public/robots.txt` and `public/sitemap.xml`.
- Privacy-conscious analytics (`src/services/analyticsService.ts`) tracking page views, product dossiers, partner visits, add-to-cart actions, and checkouts surfaced in Admin Overview.

