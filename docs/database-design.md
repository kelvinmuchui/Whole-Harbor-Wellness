# Whole Harbor Wellness — Database Design & Schema Specification
**Module 1 — System Analysis & Architecture**

---

## 1. Relational Entity Overview

The Whole Harbor Wellness database is normalized to Third Normal Form (3NF) to ensure data integrity, auditable commission tracking, and seamless analytical reporting.

### Core Tables & Models

1. **`User`**: Account records for all personas (Customers, Partner Owners, Partner Staff, System Admins, Sales Admins). Includes password hashes, status, and audit timestamps.
2. **`Session`**: Active user sessions with client user-agent and IP addresses for session expiration and revocation.
3. **`Partner`**: Verified clinics, medspas, and gyms. Holds immutable human-readable `partnerId` (`WH-P-000001`), unique `slug`, commission rates, and status (`PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED`).
4. **`PartnerUser`**: Many-to-many junction mapping partner organizations to user accounts with roles (`OWNER`, `STAFF`).
5. **`PartnerSlug`**: Historical record of slugs mapped to partner records to prevent broken external patient links if a practice rebrands.
6. **`ProductCategory`**: Taxonomy for formulations (Metabolic Support, Cellular Optimization, Tissue Recovery, Longevity, Stacks).
7. **`Product`**: Pharmaceutical-grade peptide formulations, lots, purity assays, SKU, stock quantity, and base prices.
8. **`WellnessProgram`**: Supervised multi-week tracks (e.g. 12-Week Metabolic Reset) with monthly pricing and physician oversight parameters.
9. **`Referral`**: Visitor session attribution mapping visitor cookies, partner slugs, attribution timestamps, and 30-day expiry windows.
10. **`Order`**: Order header records capturing customer details, shipping address, gross subtotal, volume discounts, partner discounts, cold-chain courier tracking numbers, and partner attribution foreign keys.
11. **`OrderItem`**: Itemized lines specifying product ID, strength packaging (e.g., 10mg / 10 Vials), quantity, unit price, and line total.
12. **`PartnerEarning`**: Auditable commission ledger records. Every earning points to a single order and partner, tracking gross sales, eligible sales, commission rate, and payout status (`PENDING`, `APPROVED`, `PAID`).
13. **`Payment`**: Payment transaction logs linked to orders with payment provider transaction references.
14. **`EducationalArticle`**: Clinical articles, research digests, and peer-reviewed summaries.
15. **`FAQ`**: Categorized frequently asked questions for patients and clinics.
16. **`Testimonial`**: Clinician and patient verified endorsements.
17. **`Promotion`**: Campaign discount codes and valid periods.
18. **`Media`**: Uploaded CoA documents, product imagery, and partner logos.
19. **`AuditLog`**: Append-only log of critical state transitions and security events.

---

## 2. Entity-Relationship Diagram

```text
+-------------------+             +-----------------------+             +-----------------------+
|       User        | 1         * |      PartnerUser      | *         1 |        Partner        |
|-------------------|-------------|-----------------------|-------------|-----------------------|
| id (PK)           |             | id (PK)               |             | id (PK)               |
| email (UQ)        |             | partnerId (FK)        |             | partnerId (UQ)        |
| passwordHash      |             | userId (FK)           |             | slug (UQ)             |
| role              |             | role (OWNER/STAFF)    |             | businessName          |
| status            |             +-----------------------+             | commissionRate        |
+-------------------+                                                   | memberDiscountRate    |
          | 1                                                           | status                |
          |                                                             +-----------------------+
          |                                                                         | 1
          | *                                                                       |
+-------------------+                                                               | *
|       Order       | *-------------------------------------------------------------+
|-------------------|
| id (PK)           |             +-----------------------+             +-----------------------+
| orderNumber (UQ)  | 1         * |       OrderItem       | *         1 |        Product        |
| customerId (FK)   |-------------|-----------------------|-------------|-----------------------|
| partnerId (FK)    |             | id (PK)               |             | id (PK)               |
| subtotal          |             | orderId (FK)          |             | sku (UQ)              |
| volumeDiscount    |             | productId (FK)        |             | slug (UQ)             |
| partnerDiscount   |             | quantity              |             | price                 |
| total             |             | unitPrice             |             | stockQuantity         |
| status            |             | total                 |             +-----------------------+
| paymentStatus     |             +-----------------------+
+-------------------+
          | 1
          |
          | 1
+-------------------+
|  PartnerEarning   |
|-------------------|
| id (PK)           |
| partnerId (FK)    |
| orderId (FK, UQ)  |
| grossSales        |
| commissionRate    |
| earningAmount     |
| status (PENDING/  |
|   APPROVED/PAID)  |
+-------------------+
```

---

## 3. Essential Architectural Queries

### Q1: Which partner referred this customer?
```sql
SELECT p.id, p.partnerId, p.businessName, p.slug, r.attributedAt, r.referralSource
FROM "Referral" r
JOIN "Partner" p ON r.partnerId = p.id
WHERE r.customerId = :customerId
ORDER BY r.attributedAt DESC
LIMIT 1;
```

### Q2: Which partner generated this order?
```sql
SELECT o.orderNumber, o.total, p.partnerId, p.businessName, o.partnerCommission
FROM "Order" o
JOIN "Partner" p ON o.partnerId = p.id
WHERE o.id = :orderId;
```

### Q3: How much revenue came from the partner this month?
```sql
SELECT 
  p.partnerId,
  p.businessName,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.subtotal), 0) AS gross_sales,
  COALESCE(SUM(pe.earningAmount), 0) AS partner_earnings
FROM "Partner" p
LEFT JOIN "Order" o ON o.partnerId = p.id 
  AND o.status = 'COMPLETED'
  AND o.createdAt >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN "PartnerEarning" pe ON pe.orderId = o.id
WHERE p.id = :partnerId
GROUP BY p.id, p.partnerId, p.businessName;
```

### Q4: What are the partner's Year-to-Date (YTD) earnings?
```sql
SELECT 
  p.partnerId,
  SUM(pe.earningAmount) AS ytd_total_earnings,
  SUM(CASE WHEN pe.status = 'PAID' THEN pe.earningAmount ELSE 0 END) AS ytd_paid_earnings,
  SUM(CASE WHEN pe.status IN ('PENDING', 'APPROVED') THEN pe.earningAmount ELSE 0 END) AS ytd_pending_earnings
FROM "PartnerEarning" pe
JOIN "Partner" p ON pe.partnerId = p.id
WHERE p.id = :partnerId 
  AND pe.createdAt >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY p.id, p.partnerId;
```

### Q5: Which products are selling most through each partner?
```sql
SELECT 
  pr.name AS product_name,
  pr.sku,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.total) AS total_revenue
FROM "OrderItem" oi
JOIN "Order" o ON oi.orderId = o.id
JOIN "Product" pr ON oi.productId = pr.id
WHERE o.partnerId = :partnerId AND o.status = 'COMPLETED'
GROUP BY pr.id, pr.name, pr.sku
ORDER BY units_sold DESC;
```
