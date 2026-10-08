# Whole Harbor Wellness — User Roles & Permissions (RBAC)
**Module 1 — System Analysis & Architecture**

---

## 1. Role-Based Access Control Architecture

Authorization in Whole Harbor Wellness is enforced **server-side** at every service and API endpoint boundary. Frontend view guards only manage navigation UX; actual resource access is validated against user session context and database ownership keys.

---

## 2. Roles & Permissions Specification

### 1. `CUSTOMER` (Patient / End Consumer)
The primary recipient of clinical wellness protocols and personalized therapies.

- **Can:**
  - Register and manage personal profile credentials and shipping address.
  - Browse active pharmaceutical formulations and wellness programs.
  - Add formulations to protocol cart and execute clinical checkouts.
  - View personal order history, cold-chain courier tracking numbers, and CoA reports.
  - Receive automated partner VIP discounts when entering through a partner referral link.
- **Cannot:**
  - Access partner telemetry, earnings, or practice rosters.
  - Access executive administration dashboards or system analytics.
  - View other customers' orders or medical questionnaires.

---

### 2. `PARTNER_OWNER` (Clinic / Gym / MedSpa Owner)
The verified administrator of an approved clinical partner organization.

- **Can:**
  - View practice telemetry dashboard (Total Orders, Completed, Pending, Gross Sales, Eligible Earnings).
  - Inspect referred patient sales and order numbers attributed to their specific `partnerId`.
  - Review an auditable commission earnings ledger with payment status (`PENDING`, `APPROVED`, `PAID`).
  - Generate and copy practice referral links (e.g. `/partner/:slug`).
  - Manage permitted practice information (business description, phone, website, social links).
  - Authorize partner staff users under their organization.
- **Cannot:**
  - Access another partner organization's sales, commissions, or customer lists.
  - Access executive system administration or catalog price overrides.
  - Change partner commission rates (must be updated by an Admin).
  - Approve or reject other partners.

---

### 3. `PARTNER_STAFF` (Care Coordinator / Front Desk / Nurse)
Operational staff assisting with patient guidance and protocol coordination under an approved partner.

- **Can:**
  - View permitted partner sales and order statuses for patient care coordination.
  - Access practice referral links and clinic marketing collateral.
- **Cannot:**
  - Modify ownership details or banking payout preferences.
  - Access system administration functions.
  - Access other partner practices.

---

### 4. `ADMIN` (Super Administrator / Executive Clinical Director)
Full administrative control over the entire Whole Harbor platform.

- **Can:**
  - Manage and audit all user accounts across all roles.
  - Review, approve, reject, or suspend partner applications and adjust custom commission rates.
  - Manage product catalog (create, edit pricing, update lot numbers, upload CoAs, adjust stock).
  - Manage order fulfillment lifecycle (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `COMPLETED`).
  - Manage partner earnings ledger: approve earnings and disburse payout batches.
  - Manage CMS content: programs, research articles, FAQs, and testimonials.
  - Review security logs, audit trails, and platform revenue analytics.

---

### 5. `SALES_ADMIN` (Partnership Director / Partner Success Manager)
Specialized administrator managing partner relations and commercial accounts.

- **Can:**
  - Onboard and manage clinical partner applications.
  - View global sales, order attribution, and partner leaderboard performance.
  - Inspect partner earnings ledgers.
- **Cannot:**
  - Alter system security configurations, database schemas, or administrator role assignments.

---

## 3. Strict Resource Ownership Enforcement

To prevent Insecure Direct Object Reference (IDOR) vulnerabilities, the system enforces the following rule:

```typescript
// Example Ownership Guard in server/rbac.ts
if (user.role === 'PARTNER_OWNER' || user.role === 'PARTNER_STAFF') {
  if (user.partnerId !== requestedResource.partnerId) {
    throw new ForbiddenError('Unauthorized: Partner user cannot access external practice records.');
  }
}
```
