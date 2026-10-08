# Whole Harbor Wellness — System Architecture Documentation
**Module 1 — System Analysis & Architecture**

---

## 1. System Overview

Whole Harbor Wellness is a clinical-grade holistic wellness and longevity platform engineered to serve two core audiences:
1. **Consumers & Patients:** Discovering certified peptide therapeutics, enrolling in physician-guided wellness tracks, managing clinical health records, and receiving cold-chain verified fulfillment.
2. **Partners (Gyms, MedSpas, Longevity Clinics, Coaches):** Receiving immutable Partner IDs (`WH-P-000001`), dedicated co-branded storefronts (`/partner/:slug`), automated 30-day referral attribution, live sales telemetry, and an auditable commission earnings ledger.

---

## 2. High-Level Architecture Diagram

```text
                            WHOLE HARBOR WELLNESS
                                      |
         +----------------------------+----------------------------+
         |                                                         |
  [ CLIENT TIER ]                                           [ BACKEND TIER ]
         |                                                         |
  React / Next.js / TypeScript                              Node.js / Express / Next Server
  Tailwind CSS (Stitch Theme)                               Zod Input Validation
  Vite SPA / Server Components                              Session & Token Security
         |                                                         |
         +------------------- RESTful API / RPC -------------------+
                                      |
                           [ CORE BUSINESS SERVICES ]
                                      |
       +--------------------+---------+---------+--------------------+
       |                    |                   |                    |
  Partner Service     Referral Service     Order Service       Audit Service
   - Partner ID Gen    - 30-day Window      - Multi-Kit Tier    - Immutable logs
   - Slug Validation   - Attribution Map    - Cold-Chain Calc   - State transitions
   - Status FSM        - VIP Discount       - Ledger Posting    - Security tracking
       |                    |                   |                    |
       +--------------------+---------+---------+--------------------+
                                      |
                         [ DATA PERSISTENCE TIER ]
                                      |
                             PostgreSQL Database
                               (Prisma ORM)
                         Normalized Relational Models
```

---

## 3. Partner Sales & Conversion Workflow

The following pipeline is the lifeblood of Whole Harbor's business model:

```text
   Partner Application
           ↓
   Admin Approval & ID Assignment (e.g. WH-P-000001)
           ↓
   Dedicated Co-Branded URL (/partner/:slug)
           ↓
   Visitor Enters via Partner Link
           ↓
   Referral Attribution Cookie (30-day attribution window)
           ↓
   Customer Registration & Protocol Selection (VIP Discount Applied)
           ↓
   Clinical Checkout & Cold-Chain Logistics Dispatched
           ↓
   Attributed Order Created (Order Number: WH-ORD-2026-XXXX)
           ↓
   Auditable Earnings Ledger Entry Created (Status: PENDING)
           ↓
   Admin Reviews & Disburses Payout (Status: APPROVED -> PAID)
```

---

## 4. Architectural Boundaries

- **Presentation Layer:** Component-based, responsive UI built with pure Tailwind CSS following the approved Whole Harbor design system (Warm Ivory, Soft Cream, Deep Olive, Warm Terracotta, Playfair Display + Inter). Zero database queries in UI components.
- **Validation Layer:** Zod schemas applied strictly to all inbound requests prior to processing.
- **Service Layer:** Pure business logic containing pricing rules, referral attribution math, and partner slug verification.
- **Persistence Layer:** Strongly typed relational models with foreign keys, compound indexes, and audit trails.
