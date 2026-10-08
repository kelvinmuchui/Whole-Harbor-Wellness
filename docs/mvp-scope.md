# Whole Harbor Wellness — MVP Roadmap & Scope Breakdown
**Module 1 — System Analysis & Architecture**

---

## 1. Complete MVP Module Roadmap

| Module | Module Name | Scope & Purpose | Status |
| :--- | :--- | :--- | :--- |
| **Module 1** | **System Analysis & Architecture** | Technical foundation, PostgreSQL/Prisma schema, RBAC, domain types, Zod validators, business services, security baselines, design tokens, and documentation. | **COMPLETED** |
| **Module 2** | **Public Website & UI/UX** | Homepage, About, Approach, Catalog layout, Brand design system implementation with Playfair Display & Inter. | *Queued* |
| **Module 3** | **Authentication & User Accounts** | Password hashing, session storage, customer portal, profile management. | *Queued* |
| **Module 4** | **Product & Program Catalog** | Formulation catalog, strength/vial selection, CoA laboratory viewer, clinical program enrollment. | *Queued* |
| **Module 5** | **Partner Management** | Partner application, unique Partner ID generation (`WH-P-000001`), approval workflows, rate adjustments. | *Queued* |
| **Module 6** | **Partner Pages & Referral Engine** | Dedicated `/partner/:slug` pages, co-branding, 30-day attribution tracking, automatic member VIP discounts. | *Queued* |
| **Module 7** | **Orders & Clinical Fulfillment** | Multi-tier volume savings (5%, 8%, 12%), cold-chain shipping logistics, checkout flow, order confirmation. | *Queued* |
| **Module 8** | **Partner Dashboard & Ledger** | Real-time sales telemetry, date range filters, CSV export, auditable commission earnings ledger. | *Queued* |
| **Module 9** | **Executive Admin Dashboard** | Platform revenue metrics, partner approval/suspension queue, order fulfillment status management. | *Queued* |
| **Module 10** | **CMS & Educational Knowledgebase** | Admin content management for research studies, articles, interactive FAQs, and verified testimonials. | *Queued* |
| **Module 11** | **SEO & Analytics** | Meta cards, OpenGraph, JSON-LD clinical schemas, conversion tracking. | *Queued* |
| **Module 12** | **Security Hardening & Deployment** | Rate limiting, pen-testing, audit verification, production container build. | *Queued* |

---

## 2. Module 1 Acceptance Criteria Checklist

- [x] Application folder structure established (`/prisma`, `/config`, `/types`, `/validators`, `/server`, `/docs`).
- [x] PostgreSQL database schema defined via Prisma (`/prisma/schema.prisma`) with normalized tables, foreign keys, and indexes.
- [x] User roles and permissions matrix established (`CUSTOMER`, `PARTNER_OWNER`, `PARTNER_STAFF`, `ADMIN`, `SALES_ADMIN`).
- [x] Input validation schemas created via Zod (`/validators/`).
- [x] Domain types and interfaces defined (`/types/`).
- [x] Security engine configured with PBKDF2/SHA-256 and constant-time string comparison (`/server/security.ts`).
- [x] Server-side RBAC and ownership guard engine implemented (`/server/rbac.ts`).
- [x] Partner ID format (`WH-P-000001`) and slug validator created (`/server/services/partnerService.ts`).
- [x] Referral attribution engine with 30-day window created (`/server/services/referralService.ts`).
- [x] Multi-tier volume discount logic (5%, 8%, 12%) and cold-chain calculations formalized (`/server/services/orderService.ts`).
- [x] Whole Harbor visual design tokens established (`/config/design-tokens.ts`).
- [x] Environment configuration template created (`.env.example`).
- [x] Full architectural documentation suite created (`/docs/`).
- [x] Project compiles with zero TypeScript errors.
