# Booking and Wallet System Documentation

This document provides a comprehensive technical overview of the Booking and Wallet flows within the Rukkoin application.

## 1. Overview
The system handles bookings for properties (Hotels, Hostels, Resorts, etc.) with multiple payment methods including **Pay at Hotel**, **Razorpay (Online)**, and **Wallet**. It features a dual-wallet system for Users and Partners.

---

## 2. Wallet Architecture

### 2.1 Wallet Model
- **Schema:** `Wallet.js`
- **Linkage:** Linked to `User` or `Partner` via `partnerId` (which stores the User/Partner `_id`).
- **Role Separation:** The `role` field ('user' or 'partner') ensures stricter separation. A single entity can theoretically have both a User Wallet and a Partner Wallet if they hold both roles.
- **Fields:**
  - `balance`: Current available funds.
  - `totalEarnings`: Cumulative earnings (Partners).
  - `pendingClearance`: Funds requested for withdrawal (Partners).
  - `bankDetails`: For payouts (Partners).

### 2.2 Wallet Operations
- **Get Wallet:** Fetch balance and stats. Auto-creates wallet if missing.
- **Add Money (Top-up):**
  - **Endpoint:** `POST /api/wallet/add-money` -> `createAddMoneyOrder`
  - **Process:** Creates Razorpay Order.
  - **Verification:** `POST /api/wallet/verify-add-money` -> Verifies signature -> Credits Wallet -> Logs `topup` Transaction.
- **Withdrawal (Partners):**
  - **Endpoint:** `POST /api/wallet/withdraw`
  - **Logic:** Checks balance -> Creates `Withdrawal` record (status `pending`) -> Deducts from `balance` -> Adds to `pendingClearance` -> Logs `withdrawal` Transaction (debit).

---

## 3. Booking Flow

### 3.1 Booking Creation (`createBooking`)
**Endpoint:** `POST /api/bookings`
**Controller:** `bookingController.js`

**Workflow:**
1.  **Validation:** Checks dates, property existence, room availability.
2.  **Calculations:** Computes `totalNights`, `baseAmount`, `extraCharges`, and `totalAmount`.
3.  **Payment Logic:**
    *   **Wallet Deduction:** If `useWallet` is true, deducts from User Wallet and logs a debit `Transaction`.
    *   **Remaining Payable:** `totalAmount - walletDeduction`.
4.  **Booking Initialization:** Creates a `Booking` record with status `pending` (if online payment needed) or `confirmed` (if Pay at Hotel / Full Wallet).

### 3.2 Payment Methods

#### A. Pay at Hotel
- **Flow:** User selects "Pay at Hotel".
- **Backend:** `paymentMethod: 'pay_at_hotel'`, `paymentStatus: 'pending'`.
- **Result:** Booking is immediately confirmed.

#### B. Full Wallet Payment
- **Flow:** User checking "Use Wallet" covers 100% of the cost.
- **Backend:** `paymentStatus: 'paid'`, `bookingStatus: 'confirmed'`.
- **Transaction:** Debit transaction created for user.

#### C. Online Payment (Razorpay)
**Flow:**
1.  **Initiation:** `createBooking` detects `paymentMethod: 'online'` and `remainingPayable > 0`.
2.  **Order Creation:** Calls Razorpay API to create an order for the *remaining amount*.
3.  **Response:** Returns `{ paymentRequired: true, order: {...}, key: ... }` to frontend.
4.  **Frontend:** Opens Razorpay Checkout with the order details.
5.  **User Action:** Completes payment.
6.  **Verification:** Frontend calls `POST /api/payments/verify`.

### 3.3 Payment Verification (`verifyPayment`)
**Endpoint:** `POST /api/payments/verify`
**Controller:** `paymentController.js`

**Workflow:**
1.  **Signature Check:** Validates `razorpay_signature` using HMAC SHA256.
2.  **Booking Update:**
    - Finds the `pending` booking created earlier.
    - Updates: `paymentStatus: 'paid'`, `bookingStatus: 'confirmed'`, `paymentId`.
3.  **Offer Usage:** Increments usage count if coupon applied.
4.  **Partner Credit (Payout):**
    - Finds Partner Wallet.
    - Credits `partnerPayout` amount to `balance`.
    - Logs `credit` Transaction (`booking_payment`).
5.  **Admin Credit (Commission):**
    - Credits Admin Wallet with `adminCommission` + `taxes`.
    - Logs `credit` Transaction (`commission_tax`).
6.  **Inventory Block:** Confirms the `AvailabilityLedger` entry (if not already strictly reserved).
7.  **Notifications:** Sends Email and Push Notification to User and Partner.

---

## 4. Cancellation & Refund Flow
**Endpoint:** `POST /api/bookings/:id/cancel`

1.  **Check:** Verifies User ownership and Booking status.
2.  **Refund Logic:**
    - **Wallet Portion:** Credited back to User Wallet immediately.
    - **Online Portion (Razorpay):** Initiates Razorpay Refund API (`payments.refund`).
3.  **Status Update:** Booking marked `cancelled`, Payment `refunded`.
4.  **Inventory Release:** Deletes `AvailabilityLedger` entry to free up room.
5.  **Partner Debit (Clawback):** If Partner was already credited, the system *should* debit the amount (Implementation detail to verify in `bookingController`).

---

## 5. API Endpoints Summary

### Wallet
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/wallet` | Get balance & stats |
| `GET` | `/api/wallet/transactions` | Get history (includes bookings for users) |
| `POST` | `/api/wallet/add-money` | Init top-up |
| `POST` | `/api/wallet/verify-add-money`| Verify top-up |
| `POST` | `/api/wallet/withdraw` | Request withdrawal (Partner) |
| `GET` | `/api/wallet/withdrawals` | withdrawal history |

### Booking
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bookings` | Create Booking |
| `POST` | `/api/payments/verify` | Verify Razorpay Payment |
| `POST` | `/api/bookings/:id/cancel` | Cancel & Refund |

---

## 6. Frontend Key file
- `BookingCheckoutPage.jsx`: Handles the complex logic of switching between payment modes, calculating balances, and invoking the Razorpay SDK.
- `apiService.js`: Centralized API calls.
