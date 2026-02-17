# Refer and Earn Module Documentation - RukkooIn

This document provides a comprehensive overview of the **Refer and Earn** logic implemented in the RukkooIn platform (both Backend and Frontend), detailing the flow from code generation to reward distribution.

---

## 1. Backend Architecture

### Data Models
- **`ReferralCode`**: Stores unique referral codes.
    - Fields: `code` (Unique), `ownerId` (User/Partner ID), `ownerType`, `referralProgramId`, `usageCount`.
- **`ReferralProgram`**: Defines the active campaign rules.
    - Fields: `rewardAmount` (Default: ₹200), `triggerType` (`first_booking` or `signup`), `eligibleRoles`.
- **`ReferralTracking`**: Tracks the relationship between referrer and referee.
    - Fields: `referrerId`, `referredUserId`, `status` (`pending`, `completed`), `rewardAmount`, `triggerBookingId`.

### Business Logic (`referralService.js`)
1.  **Code Generation**:
    - Automatically triggered for new users upon signup or first visit to stats.
    - Format: `NAME_PREFIX + RANDOM_4_DIGITS`.
2.  **Signup Processing (`processReferralSignup`)**:
    - Called when a new user provides a code during registration.
    - Creates a `ReferralTracking` record with status `pending`.
    - Increments `usageCount` on the referral code.
3.  **Reward Unlock (`processBookingCompletion`)**:
    - Triggered when a booking is completed (`checkout` flow).
    - Updates tracking status to `completed`.
    - Credits the **Referrer's Wallet** and the **Referee's Wallet** (Both earn ₹200).
    - Sends Push Notifications and Emails to both parties.

### API Endpoints
- `GET /api/referral/my-stats`: Returns the user's referral code, link, invited/joined counts, and history.
- `GET /api/referral/program/active`: Fetches current reward rules.
- `POST /api/referral/program`: (Admin) Create/Update campaigns.

---

## 2. Frontend Flow

### User Interface (`ReferAndEarnPage.jsx`)
- **Invite Tab**: Displays the unique referral code and "Share Link".
- **Earnings Tab**: Shows total earned vs pending rewards.
- **History Tab**: List of friends who joined and their current status (Pending/Completed).

### User Experience Flow
1.  **User A shares code**: Navigates to "Refer & Earn" from the Mobile Menu/Settings, copies the code/link.
2.  **User B signs up**: (Potential Flow) Clicks the link or enters the code during signup.
3.  **Reward Pipeline**: 
    - Once User B completes their stay, User A gets a notification: *"Your friend completed their stay! ₹200 added to your wallet."*
    - User B also gets a welcome bonus notification.

---

## 3. Critical Issues & Logic Gaps (Frontend)

During the audit, the following **major issues** were identified in the frontend implementation that prevent the flow from working correctly:

### ❌ Issue 1: Missing Referral Code Input in Signup
- **Location**: `frontend/src/pages/auth/UserSignup.jsx`
- **Problem**: There is **no input field** for the user to enter a referral code during registration. Even though the backend is ready to process it, the frontend never sends it.
- **Impact**: Referrals cannot be tracked as users have no place to input the code.

### ❌ Issue 2: No Referral Link Handler (`/r/:code`)
- **Location**: `frontend/src/App.jsx`
- **Problem**: The shared link format is `rukkoo.in/r/CODE`. However, there is no route in `App.jsx` to handle this.
- **Expected**: Clicking the shared link should capture the code from the URL, store it in `localStorage`, and auto-fill it at the signup page.
- **Impact**: Shared links effectively just open the home page (or login) without recording which friend invited them.

### ❌ Issue 3: Hardcoded Stats in UI
- **Location**: `frontend/src/pages/user/ReferAndEarnPage.jsx`
- **Problem**: The "Pending Earnings" and "This Month Earnings" fields are set to `0` (lines 37-38).
- **Impact**: Users cannot see how much reward is "in the pipeline" from friends who have joined but haven't booked yet. The backend needs a small update to provide these aggregations, and the frontend needs to map them.

### ❌ Issue 4: Incomplete Invitation Tracking
- **Problem**: The UI shows "Invited" and "Joined" as separate stats, but the backend currently maps both to `usageCount`.
- **Recommendation**: "Invited" should ideally track link clicks (requires a redirect backend route), while "Joined" tracks actual signups.

---

## 4. Recommended Fixes (Immediate)

1.  **Add `referralCode` field** to the first step of `UserSignup.jsx`.
2.  **Add a Dynamic Route** in `App.jsx` for `/r/:referralCode` that stores the code and redirects to `/signup`.
3.  **Update `authService.verifyOtp`** call to include the `referralCode` if available in local state/storage.
4.  **Enhance `ReferralService.getReferralStats`** in the backend to calculate `pendingEarnings` by summing `rewardAmount` where status is `pending`.

---
*Documentation generated on 2026-02-17*
