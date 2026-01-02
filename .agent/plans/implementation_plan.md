# Implementation Plan: Rebranding & Hotel Room Management

This plan outlines the steps to rebrand "Rukkoin" to "Rukkoo.in" and implement advanced Room Management features for Hotel Partners.

## Phase 1: Rebranding (Global)

**Objective:** Change all visible instances of "Rukkoin" to "Rukkoo.in" across the entire application.

### 1.1 Analysis & Search
- **Action:** Perform a case-insensitive global search for "rukkoin".
- **Scope:**
  - `frontend/src/pages/` (User, Auth pages)
  - `frontend/src/components/` (Header, Footer, UI elements)
  - `public/` (Title tags, Manifests - if applicable)
  - `frontend/index.html` (Page Title)
  - `frontend/src/app/partner/` (Partner Dashboard & Pages)

### 1.2 Execution Strategy
- **Text Replacement:**
  - Replace "Rukkoin" -> "Rukkoo.in" in visible text (headings, buttons, paragraphs).
  - Replace "rukkoin" -> "rukkoo.in" in URLs or display links if specific.
- **Code Safety:**
  - **Do NOT** change internal variable names (e.g., `const rukkoinApp = ...`) unless necessary for consistency, to avoid breaking logic.
  - **Do NOT** change API endpoints unless the backend has also changed (assuming frontend-only task for now).
  - **Do NOT** change file names unless explicitly requested (to maintain import integrity).

### 1.3 Verification
- Manually verify key pages:
  - Landing Page (Hero section, Footer)
  - Login/Signup Pages
  - Partner Dashboard Header
  - Browser Tab Title

---

## Phase 2: Hotel Module - Room Management

**Objective:** Enable Hotel Partners to manage individual rooms (Add, Edit, Delete, Update Price) for their listed properties within the Dashboard.

### 2.1 Architecture & State Management (`partnerStore.js`)
- **Action:** Extend the existing `partnerStore` or creating a local state mechanism to handle `rooms`.
- **Data Structure:**
  ```javascript
  // Proposed Room Object Structure
  {
    id: "room_123",
    propertyId: "prop_1", // Links to the specific hotel
    type: "Deluxe Suite", // Room Category
    price: 4500,          // Price per night (Updatable)
    guestLimit: 2,
    amenities: ["AC", "WiFi", "TV"],
    images: ["url1", "url2"],
    available: true
  }
  ```
- **Store Actions:**
  - `addRoom(propertyId, roomData)`
  - `updateRoom(roomId, updates)` (Used for Price & Details)
  - `deleteRoom(roomId)`

### 2.2 New Components

#### A. `RoomManager.jsx` (New Page/Section)
- **Location:** `src/app/partner/pages/RoomManager.jsx`
- **Route:** `/partner/property/:id/rooms`
- **Function:**
  - Displays a header: "Manage Rooms for [Property Name]".
  - Shows a **"Add Room"** button (Primary Action).
  - Lists existing rooms using a Grid layout.

#### B. `RoomCard.jsx` (Component)
- **Visuals:**
  - Room Thumbnail.
  - Title (e.g., "Super Deluxe").
  - **Price Badge:** Prominently displays price.
  - **Action Buttons:** "Edit" (Pencil Icon), "Delete" (Trash Icon).

#### C. `AddEditRoomModal.jsx` (UI Component)
- **Function:** A reusable modal/bottom sheet for adding or editing a room.
- **Fields:**
  - **Room Type:** Selection (Standard, Deluxe, Suite, etc.).
  - **Base Price:** Number input (Critical for "Update Price" feature).
  - **Capacity:** Number of guests.
  - **Amenities:** Checkbox list (similar to Property facilities).
  - **Photos:** Image upload section.

### 2.3 Integration Steps

1.  **Update `PartnerDashboard.jsx`**:
    - Add a **"Manage Rooms"** button to each Property Card (next to "Edit Details").
    - Clicking this navigates to the `RoomManager` view.

2.  **Implement `RoomManager` Logic**:
    - Fetch rooms for the selected property (from Store/Mock Data).
    - Render `RoomCard` List.

3.  **Implement CRUD Logic**:
    - **Create:** Open Modal -> Form Submit -> Add to Store.
    - **Read:** Display data in `RoomCard`.
    - **Update:** Open Modal with data -> Form Submit -> Update Store (specifically Price).
    - **Delete:** Show Confirmation Alert -> Remove from Store.

### 2.4 User Flow
1.  User logs in to **Partner Dashboard**.
2.  User sees their listed hotel.
3.  User clicks **"Manage Rooms"**.
4.  User sees empty state or list of rooms.
5.  User clicks **"Add New Room"**, fills details & price, saves.
6.  Room appears in list.
7.  User clicks **"Edit"** to change the price for high season, saves.
8.  Price updates immediately in the view.
