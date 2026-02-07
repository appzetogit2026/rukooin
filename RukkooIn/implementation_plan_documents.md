---
description: Update Property Documents Logic
---

# Objective
Update the document submission requirements for all property types in the partner frontend, backend validation, and admin display.

# Requirements mapping
| Property Type | Documents | Required/Optional |
| :--- | :--- | :--- |
| **Hotel** | Trade License | Required |
| **Villa** | Trade License | Required |
| **Villa** | Electricity Bill | Optional |
| **Resort** | Trade License | Required |
| **Resort** | Electricity Bill | Optional |
| **Homestay** | Electricity Bill | Required |
| **Hostel** | Trade License | Required |
| **Hostel** | Rent Agreement | Required |
| **PG** | Trade License | Required |
| **PG** | Rent Agreement | Required |

# Implementation Plan

## Phase 1: Frontend - Partner Wizards
Update the `REQUIRED_DOCS` constant and validation logic in the following files:

1.  **AddHotelWizard.jsx**
    *   `trade_license` (Required)
2.  **AddVillaWizard.jsx**
    *   `trade_license` (Required)
    *   `electricity_bill` (Optional)
3.  **AddResortWizard.jsx**
    *   `trade_license` (Required)
    *   `electricity_bill` (Optional)
4.  **AddHomestayWizard.jsx**
    *   `electricity_bill` (Required)
5.  **AddHostelWizard.jsx**
    *   `trade_license` (Required)
    *   `rent_agreement` (Required)
6.  **AddPGWizard.jsx**
    *   `trade_license` (Required)
    *   `rent_agreement` (Required)

**Tasks for each file:**
- Update the `REQUIRED_DOCS_...` constant structure to include a `required` boolean field.
- Update the state initialization if necessary.
- Update the validation function (`nextFromDocs` or `submitAll`) to check `doc.fileUrl` only if `doc.required` is true.
- Update the UI to show "(Optional)" or "(Required)" labels and visually distinguish them.

## Phase 2: Backend - Validation
1.  **Analyze `Property.js` Model**: Check if specific document types are enforced in the schema. Update if necessary to allow flexibility or enforce new types.
2.  **Analyze Controller**: Check `propertyController.js` or `hotelController.js` for validation logic. Ensure it respects the new required/optional rules per property type.

## Phase 3: Frontend - Admin Panel
1.  **Admin Property Details**: Check `AdminPropertyDetails.jsx` (or similar). Ensure it renders the documents dynamically. If it expects specific hardcoded types, update it to render whatever documents are present.

