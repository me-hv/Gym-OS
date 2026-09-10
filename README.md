# GYM OS — The Modern Operating System for Independent Gyms

**GYM OS** is a commercial-grade, high-density B2B SaaS platform engineered for independent gym owners. Designed with the aesthetic discipline and craftsmanship of Linear, Stripe, and Apple, GYM OS enables gym operators to monitor and orchestrate their entire business within approximately 5 seconds of glance time.

![GYM OS Dashboard](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80)

---

## ⚡ Key Highlights & Core Features

### 1. 5-Second Executive Health Dashboard
- **Instant Health KPIs**: Active Members, Today's Attendance, Monthly Recurring Revenue (in INR `₹`), and **Revenue at Risk**.
- **Revenue at Risk Retention Command**: Immediate visibility into expiring memberships with 1-click WhatsApp renewal prompt dispatch.
- **Revenue Velocity & Target Tracking**: Interactive Area Chart comparing collection velocity against monthly business targets.
- **Hourly Peak Load & Floor Density**: Hourly check-in load breakdown (6:00 AM – 10:00 PM).
- **Membership Health Breakdown**: Active, Expiring, Expired, and Frozen distribution.

### 2. Members Directory & Roster
- Search by athlete name, phone (`+91`), member code, or plan tier.
- Multi-faceted status filters (`Active`, `Expiring Soon`, `Expired`, `Frozen`).
- Table view with attendance regularity sparklines, last visit timestamps, and quick actions.
- **New Member Enrollment Drawer**: Multi-step onboarding capturing fitness goals, coach assignment, locker allocation, payment methods, and emergency contacts.

### 3. Deep Member Profile Dossier
- Comprehensive identity specs, membership parameters, and trainer observations.
- **30-Day Attendance Heatmap Matrix**: Calendar matrix highlighting consistency vs rest days.
- **Invoices & Receipts Ledger**: Full financial transaction history with 1-click GST invoice receipts.
- **Activity & Communications Timeline**: Check-in logs, WhatsApp renewal reminders, and trainer induction notes.
- **Interactive Operations**: Instant check-in, WhatsApp reminder dispatch, balance collection, and membership freeze/pause.

### 4. Attendance Management & Churn Prevention Desk
- **Front Desk Fast-Lane Check-In Console**: Auto-suggest and numeric ID scanner with live floor occupancy counter.
- **Today's Live Attendance Feed**: Timestamped floor entries with workout goals and assigned coaches.
- **Absentee Retention Watch**: Churn prevention engine flagging athletes inactive for 7+ days with 1-click WhatsApp re-engagement prompts.

### 5. Membership Plans & Pricing Architecture
- Pre-configured tiers: Annual Strength Pro, 6-Month Transformation, 3-Month Functional Fit, Monthly Flex Access, and Personal Training 16X.
- Yield analytics, duration, pricing in INR (`₹`), enrolled athlete counts, and amenity checklists.
- **Create Plan Modal**: Custom package tier creator with duration, pricing, and feature tag builder.

### 6. Payments & Financial Ledger
- MTD Revenue breakdown, collected settlements, pending dues, and overdue receivables.
- Payment method distribution (UPI 62%, Credit Card 24%, Cash 10%, Net Banking 4%).
- GST-compliant transaction ledger with UTR reference tracking.
- **Record Manual Payment Dialog** with automatic 18% GST calculation.
- **Tax Invoice & Receipt Modal** with GSTIN, line-item tax breakdown (CGST/SGST), and printable/downloadable layout.

---

## 🛠 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom dark charcoal tokens)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Typography**: Inter + JetBrains Mono

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Setup

```bash
# Clone repository
git clone https://github.com/me-hv/Gym-OS.git
cd Gym-OS

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Typecheck

```bash
npm run build
```

---

## ⌨️ Keyboard Shortcuts

- `⌘K` or `Ctrl+K`: Open Command Bar (Jump to any view, search members, execute actions)
- `ESC`: Close open modals, drawers, or command palette

---

## 📄 License
MIT License. Built for modern independent gym owners.
