# 🏦 Corporate Treasury & Ledger Dashboard

A high-fidelity, real-time B2B financial clearing application built for secure capital management, asset allocation tracking, and automated ledger reconciliation.

This platform bridges the gap between external payment gateways and internal database ledgers, providing administrators with a secure terminal to execute outbound payouts, manage departmental budgets, and audit transaction histories with millisecond accuracy.

---

## ✨ Core Features

*   **Real-Time Ledger Audit Trail:** Live database synchronization powered by automated Stripe webhooks, instantly updating UI badges from `PENDING` to `SETTLED`.
*   **Dynamic Asset Allocations:** Live budget tracking that automatically calculates expenditure across Operational Expenses (Software, Hardware, Legal) while filtering out Corporate Treasury Actions (Dividends, Taxes).
*   **Secure Access Terminal:** Enterprise-grade authentication flow with session management, secure sign-out protocols, and local developer environment bypasses.
*   **Interactive System Diagnostics:** A live pipeline health monitor that tracks webhook connections, database latency, and SSL encryption status.
*   **Advanced Data Grid:** Highly optimized, paginated transaction tables featuring state-based filtering and slide-out payload inspection drawers.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS, `shadcn/ui`, Radix Primitives
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
*   **Financial Engine:** Stripe API & Stripe Webhooks
*   **Icons:** Lucide React

---

## 🔐 Environment Variables

To run this project locally, you will need to create a `.env.local` file in the root directory and configure the following keys:

```env
# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
