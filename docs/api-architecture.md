# Whole Harbor Wellness — API Architecture & Service Boundaries
**Module 1 — System Analysis & Architecture**

---

## 1. API Architecture Philosophy

- **Stateless RESTful Design:** Standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with standard status codes.
- **Consistent Response Schema:** All responses conform to a unified wrapper structure:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": { "timestamp": "2026-10-05T00:00:00Z" }
  }
  ```
- **Strict Server-Side Validation:** All inbound payloads are validated using Zod schemas before touching business services.
- **Standardized Error Responses:**
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid formulation tier selected",
      "details": { "quantity": ["Quantity must be greater than 0"] }
    }
  }
  ```

---

## 2. API Endpoint Directory

### Authentication & User Profiles
| Endpoint | Method | Auth Required | Minimum Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | None | Register new customer or partner user |
| `/api/auth/login` | `POST` | Public | None | Verify credentials & issue session token |
| `/api/auth/logout` | `POST` | Yes | `CUSTOMER` | Invalidate active session |
| `/api/auth/me` | `GET` | Yes | `CUSTOMER` | Retrieve current authenticated profile |
| `/api/users/profile` | `PUT` | Yes | `CUSTOMER` | Update account details & shipping address |

---

### Product Catalog & Programs (Public / Patient Browsing)
| Endpoint | Method | Auth Required | Minimum Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Public | None | List active products, filter by category/purity |
| `/api/products/:slug` | `GET` | Public | None | Detailed formulation specs, lot number & CoA |
| `/api/categories` | `GET` | Public | None | List product categories |
| `/api/programs` | `GET` | Public | None | List physician-guided longevity tracks |
| `/api/programs/:slug` | `GET` | Public | None | Detailed program syllabus & pricing |

---

### Partner Ecosystem & Co-Branded Landing Pages
| Endpoint | Method | Auth Required | Minimum Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/partners/apply` | `POST` | Public | None | Submit partner registration application |
| `/api/partners/:slug` | `GET` | Public | None | Fetch co-branded storefront, discounts & curated items |
| `/api/partner/dashboard` | `GET` | Yes | `PARTNER_STAFF` | Fetch partner KPI telemetry (Orders, Gross Sales, Earnings) |
| `/api/partner/sales` | `GET` | Yes | `PARTNER_STAFF` | Filterable, paginated referred sales table |
| `/api/partner/earnings` | `GET` | Yes | `PARTNER_OWNER` | Auditable earnings ledger with payout statuses |

---

### Clinical Orders & Checkout
| Endpoint | Method | Auth Required | Minimum Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/orders` | `POST` | Public / Yes | None | Execute checkout, calculate tier volume savings & attribution |
| `/api/orders/:id` | `GET` | Yes | `CUSTOMER` | View order status, items, and cold-chain tracking |
| `/api/customer/orders` | `GET` | Yes | `CUSTOMER` | List all orders belonging to authenticated patient |

---

### Administration & CMS (Restricted)
| Endpoint | Method | Auth Required | Minimum Role | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/api/admin/dashboard` | `GET` | Yes | `SALES_ADMIN` | Executive KPI cards & revenue charts |
| `/api/admin/partners` | `GET` | Yes | `SALES_ADMIN` | List all partner applications with search |
| `/api/admin/partners/:id/status` | `PATCH` | Yes | `ADMIN` | Transition status (`APPROVED`, `SUSPENDED`, `REJECTED`) |
| `/api/admin/partners/:id/rates` | `PATCH` | Yes | `ADMIN` | Update commission rate or member discount rate |
| `/api/admin/orders` | `GET` | Yes | `SALES_ADMIN` | Global order fulfillment queue |
| `/api/admin/orders/:id/status` | `PATCH` | Yes | `ADMIN` | Advance status (`PROCESSING`, `SHIPPED`, `COMPLETED`) |
| `/api/admin/payouts/:id` | `PATCH` | Yes | `ADMIN` | Approve partner earning or mark as `PAID` |
| `/api/admin/products` | `POST` | Yes | `ADMIN` | Create new clinical formulation |
| `/api/admin/products/:id` | `PUT` | Yes | `ADMIN` | Update formulation pricing, stock, lot number |
| `/api/admin/content` | `GET/POST` | Yes | `ADMIN` | Manage articles, FAQs, testimonials |
