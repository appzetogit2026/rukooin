# 🎯 Admin Panel Architecture & Implementation Plan - Rukkooin
**Role**: Senior Product Architect | **Stack**: MERN (Vite + Node.js) | **DB**: MongoDB

---

## 🧠 STEP 1: FULL PROJECT ANALYSIS
**Objective**: The Admin Panel is the "God Mode" of the platform. It bridges the gap between **Guests (Users)** and **Partners (Hotels)** while ensuring platform integrity, revenue flow, and dispute resolution.

### 1. Business Model Flow
1.  **Hotel Owner** lists property -> **Admin** verifies & approves -> **Property** goes live.
2.  **User** searches & books -> **Platform** holds payment -> **Booking** Confirmed.
3.  **Check-in/Check-out** happens -> **Admin** releases payout to Hotel (minus commission).
4.  **Disputes/Cancellations** -> **Admin** intervenes (Refunds/Penalties).

### 2. User Types
-   **Super Admin**: Full access to financial, settings, and team management.
-   **Support Admin**: Access to bookings, disputes, and user/hotel management (restricted financials).
-   **Content Moderator**: Access to approvals (photos, texts) only.

### 3. Data Flow
`User Action` <--> `API Gateway` <--> `Admin Control` <--> `Database`
-   **Verification**: Hotel uploads docs -> Admin Dashboard notification -> Admin reviews -> Status Update.
-   **Financial**: Payment Gateway Webhook -> Admin Ledger -> Payout Schedule.

---

## 🗂️ STEP 2: ADMIN PANEL OBJECTIVE
The goal is **Efficiency, Oversight, and Scalability**.
-   **Automated**: Invoices, basic notifications, status transitions.
-   **Manual**: dispute resolution, KYC verification, emergency blocks, payout release approvals.
-   **Configurable**: Commission rates (global/individual), cancellation policies, featured algorithm weightage.

---

## 🧱 STEP 3: ADMIN PANEL STRUCTURE (HIGH LEVEL)
**Layout**: Sidebar (fixed), Topbar (Global Search + Notifications), Main Content (Scrollable with Lenis).

### Sidebar Structure
1.  **Dashboard** (Analytics command center)
2.  **User Management** (Guests)
3.  **Hotel Management** (Partners & Inventory)
4.  **Bookings & Operations** (Live status)
5.  **Finance** (Earnings, Payouts, Refunds)
6.  **Content & CMS** (Banners, policies, coupons)
7.  **Access Control** (Sub-admins)
8.  **Settings** (Platform config)

### Global Utilities
-   **Command K Search**: Search any UserID, BookingID, or HotelName instantly.
-   **Notification Center**: Real-time alerts (New Hotel Request, High-value Booking, Dispute Raised).

---

## 🧑‍💼 STEP 4: USER MODULE — ADMIN CONTROL
**Goal**: Manage guests, ensure safety, and handle support.

### Features
-   **User List**: `DataTable` with server-side pagination. Columns: Name, Email, Phone, Bookings Count, Status.
-   **Profile Detail View**:
    -   **Identity**: Verified status (green badge), KYC docs (if applicable).
    -   **Metrics**: Total spend, specific preferences.
    -   **Actionable**: Reset Password, Block User (with reason), Send Notification.
-   **History**: Full timeline of bookings and cancellations.

### Database Strategy
-   `users` collection with `isBlocked`, `riskScore`.

---

## 🏨 STEP 5: HOTEL MODULE — ADMIN CONTROL
**Goal**: Quality control and supply management.

### Features
-   **Onboarding Pipeline**:
    -   *Pending* -> *KYC Review* -> *Property Review* -> *Approved/Start Selling*.
-   **Property Detail View**:
    -   **Override capability**: Admin can change room prices/availability in emergencies.
    -   **Quality Score**: Internal rating based on user reviews & cancellation rate.
-   **Moderation**:
    -   **Photos**: Gallery view to approve/reject inappropriate images.
    -   **Reviews**: Dispute handling for "fake reviews".

---

## 📅 STEP 6: BOOKING & OPERATIONS CONTROL
**Goal**: The heart of the daily operations.

### Live Dashboard
-   **Kanban/List View**: Pending -> Confirmed -> Checked-In -> Completed -> Cancelled.
-   **Real-time Filters**: "Check-ins Today", "Disputed", "Requires Attention".

### Conflict Resolution
-   **Force Cancel**: Admin receives authority to cancel booking on behalf of Hotel/User.
-   **Refund Logic**:
    -   Full Refund (Platform loss or Hotel penalty).
    -   Partial Refund (Policy based).
    -   No Refund.

---

## 💰 STEP 7: PAYMENTS, COMMISSION & REVENUE
**Goal**: Financial integrity.

### Features
-   **Commission Engine**: Set global default (e.g., 15%) or override per hotel (e.g., 10% for strategic partners).
-   **Payout Management**:
    -   List of "Due Payments" to hotels.
    -   "Mark as Paid" button (manual or connected to Payout API).
    -   Invoice Download for Hotel Partners.
-   **Platform Earnings**: Real-time calc of `(Booking Value * Commission %) - Taxes`.

---

## ⚙️ STEP 8: SETTINGS & CONFIGURATION
**Goal**: No-code platform adjustments.

### Modules
-   **Pricing Rules**: GST/VAT settings, cleaning fee limits.
-   **Feature Flags**: Enable/Disable "Pay at Hotel", "Coupons".
-   **CMS**: Edit "About Us", "Terms", "Privacy Policy" content directly.

---

## 📊 STEP 9: DASHBOARD & ANALYTICS
**Visuals**: High-end charts (Recharts/Chart.js).

### KPIs
-   **Gross Booking Value (GBV)**.
-   **Take Rate** (Average Commission).
-   **Occupancy Rate** (Platform wide).
-   **CAC** (if marketing data connected).
-   **Heatmap**: User origin vs. Hotel location.

---

## 🧩 STEP 10: PHASE-WISE DEVELOPMENT PLAN

### Phase 1: Foundation & Auth (Week 1)
-   Setup `admin` folder in frontend.
-   Admin Login/Auth (JWT).
-   Basic Layout (Sidebar, Topbar).
-   **Deliverable**: Admin can log in and see a blank dashboard.

### Phase 2: User & Hotel Read-Access (Week 1-2)
-   Connect to MongoDB.
-   User List & Detail Page.
-   Hotel List & Detail Page.
-   **Deliverable**: Admin can view data (Read Only).

### Phase 3: Hotel Onboarding & Verify (Week 2-3)
-   Hotel Approval Workflow.
-   KYC Document Viewer.
-   Status Toggle (Active/Inactive).
-   **Deliverable**: Hotels can be approved to go live.

### Phase 4: booking Operations (Week 3-4)
-   Booking List with Filters.
-   Booking Detail View.
-   Manual Cancellation Actions.
-   **Deliverable**: Full control over booking lifecycle.

### Phase 5: Finance & Analytics (Week 4+)
-   Earnings Charts.
-   Payout Table.
-   Settings Page.

---

## 🧠 STEP 11: DATABASE & API DESIGN (MongoDB)

### Core Collections
1.  **Admins**: `{ name, email, passwordHash, role, permissions[] }`
2.  **Users**: Standard user schema + `{ isBlocked, notes }`
3.  **Hotels**: `{ ownerId, status: 'pending'|'approved'|'rejected', commissionRate, kycStatus }`
4.  **Bookings**: `{ hotelId, userId, status, paymentStatus, payoutStatus, totalAmount, platformFee }`
5.  **AuditLogs**: `{ adminId, action, targetId, timestamp, details }`

### Key Admin APIs
-   `GET /admin/stats/dashboard` (Aggregated metrics)
-   `POST /admin/hotels/:id/approve` (Triggers notification)
-   `POST /admin/bookings/:id/force-cancel` (Handles refund logic)
-   `GET /admin/finance/payouts-due`
-   `PATCH /admin/settings/config`

---

## 🎨 STEP 12: UI/UX + ANIMATION GUIDELINES
**Theme**: Consistent with Hotel Partner module (White/Black/Grays).
**Framework**: Tailwind CSS.

### Guidelines
1.  **Typography**: Inter or Plus Jakarta Sans. Clean, professional.
2.  **Animations (GSAP/Framer)**:
    -   **Table Rows**: Staggered fade-in on load.
    -   **Modals**: Smooth scale-up with backdrop blur.
    -   **Sidebar**: Collapsible with smooth width transition.
3.  **Scroll (Lenis)**:
    -   Global smooth scroll for the main content area.
4.  **Visual Hierarchy**:
    -   Primary Actions: Black Background, White Text.
    -   Destructive Actions: Red Text or soft Red Background.
    -   Status Badges: Soft pastel backgrounds (Green/Yellow/Red) with dark text.

---
