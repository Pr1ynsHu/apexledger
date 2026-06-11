# 🏦 ApexLedger: Corporate Treasury & Financial Management Platform

A high-fidelity, real-time B2B financial clearing and treasury management application built for secure capital management, asset allocation tracking, and automated ledger reconciliation.

ApexLedger bridges the gap between external banking gateways and internal database ledgers. It provides administrators with a secure terminal to execute outbound payouts, manage departmental budgets, analyze spending with AI, and audit transaction histories with millisecond accuracy.

---

## ✨ Core Features

*   **Real-Time Ledger Audit Trail:** Live database synchronization powered by automated Stripe and Plaid webhooks, instantly updating UI badges and ledger statuses from `PENDING` to `SETTLED`.
*   **Dynamic Asset Allocations (Vaults):** Live budget tracking that automatically calculates expenditure across Operational Expenses while filtering out Corporate Treasury Actions. Manage your capital efficiently using dedicated "Vaults".
*   **Fund Transfers & Disbursements:** Securely initiate and manage fund transfers between accounts and process outbound payouts. 
*   **AI-Powered Insights:** Integrated with Google Generative AI to provide smart insights, transaction categorizations, and treasury forecasting.
*   **Secure Access Terminal:** Enterprise-grade authentication flow with session management and secure sign-out protocols using Supabase.
*   **Interactive System Diagnostics:** A live pipeline health monitor (via AxiomHQ and LogRocket) that tracks webhook connections, database latency, and system events.
*   **Advanced Data Grid & Visualizations:** Highly optimized, paginated transaction tables featuring state-based filtering, paired with interactive financial charts (Recharts).
*   **PDF Report Generation:** Instantly generate and download comprehensive financial statements and ledger reports in PDF format.

---

## 🛠️ Technology Stack

**Framework & Core:**
*   Next.js 16 (App Router)
*   React 19
*   TypeScript

**Database & Authentication:**
*   Supabase (PostgreSQL, Row Level Security, Auth)

**Financial Integrations:**
*   Plaid API (Bank account linking and transaction sync)
*   Stripe API & Webhooks (Payments and ledger clearing)

**UI & Styling:**
*   Tailwind CSS v4
*   `shadcn/ui` & Radix UI Primitives (Accessible components)
*   Lucide React (Icons)
*   Recharts (Financial charts & data visualization)

**AI & Utilities:**
*   Google Generative AI (Gemini for financial insights)
*   React Hook Form + Zod (Schema-validated forms)
*   jsPDF (Client-side PDF report generation)
*   Date-fns (Date and time manipulation)

**Observability & Monitoring:**
*   AxiomHQ (Logging)
*   LogRocket (Session replay & performance monitoring)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and configured:
*   Node.js (v20+)
*   npm, yarn, or pnpm
*   Accounts for Supabase, Stripe, Plaid, Google AI Studio, Axiom, and LogRocket.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Pr1ynsHu/apexledger.git
    cd bank
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and configure the necessary keys:

    ```env
    # Supabase Integration
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    
    # Stripe Integration
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...

    # Plaid Integration
    PLAID_CLIENT_ID=your_plaid_client_id
    PLAID_SECRET=your_plaid_secret
    NEXT_PUBLIC_PLAID_ENV=sandbox # sandbox, development, or production
    NEXT_PUBLIC_PLAID_CLIENT_NAME="ApexLedger"

    # Google Generative AI
    GOOGLE_GEMINI_API_KEY=your_gemini_api_key

    # Monitoring (Axiom & LogRocket)
    AXIOM_TOKEN=your_axiom_token
    NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_app_id
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

*   `/app` - Next.js App Router pages, layouts, and API routes. Includes dashboard, ledger, transfer, vaults, etc.
*   `/components` - Reusable UI components (shadcn/ui, charts, navigation).
*   `/lib` - Utility functions, database clients, and API helpers.
*   `/public` - Static assets like images and fonts.

---

## 🛡️ Security

This project utilizes Row Level Security (RLS) policies within Supabase to ensure that users can only access their authorized financial data. All API routes validating Stripe and Plaid webhooks implement strict signature verification.
