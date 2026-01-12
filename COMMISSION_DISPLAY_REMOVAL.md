# ✅ Removed Internal Pricing Logic from User View

## Overview
As per the user request, I have removed the "Money Distribution" (Admin Commission & Partner Share) section from the `BookingConfirmationPage`. This ensures that guests only see relevant payment information (Total Amount, Discount, Payable), keeping internal revenue splits private.

## Changes
- **File:** `frontend/src/pages/user/BookingConfirmationPage.jsx`
- **Action:** Removed the `div` block displaying `partnerEarning` and `adminCommissionOnBase`.

## Current View
The Pricing Breakdown card now only shows:
- **Coupon Discount** (if applicable)
- **Amount You Paid** / **Total Amount**

## Verification
1. Create a Booking.
2. Go to Confirmation Page.
3. Pricing section should be clean and guest-focused.

**Status: COMPLETE**
