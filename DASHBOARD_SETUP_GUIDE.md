# PageStudio Dashboard Integration Guide

## Overview

Your dashboard is now structured with:

- **Frontend**: Login protection, UI rendering
- **Backend**: Authentication, Contentful API calls via server actions
- **Security**: Role-based access control (RBAC)

---

## 1. File Structure

```
app/
├── actions.ts                    ← Updated with roles & Contentful fetch
├── login/
│   └── page.tsx                  ← Fix: use next/navigation
├── dashboard/
│   └── page.tsx                  ← NEW: Protected route
└── ...

components/
├── Login.tsx                      ← Existing
├── Dashboard.tsx                  ← NEW: Main dashboard UI
└── ...

lib/
├── hooks/
│   └── useAuth.ts                ← Updated with logout
└── contentful/
    └── contentfulClient.ts        ← NEW: Contentful adapter
```

---

## 2. Installation & Setup

### Step 1: Install Contentful SDK

```bash
npm install contentful
```

### Step 2: Add Environment Variables

Create `.env.local` in your project root:

```env
# Contentful Settings → API Keys
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id_here
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_PREVIEW_TOKEN=your_preview_token_here

```

**How to find these in Contentful:**

1. Log in to Contentful
2. Go to Settings → API Keys
3. Create or use an existing API key
4. Copy: Space ID, Access Token (Content Delivery API), Preview Token

### Step 3: Copy Files

Copy these files to your project:

1. `lib/contentful/contentfulClient.ts`
2. `app/actions.ts` (merge with existing)
3. `components/Dashboard.tsx`
4. `app/dashboard/page.tsx`
5. `lib/hooks/useAuth.ts`

---

## 3. Contentful Content Model

Your dashboard expects this content type in Contentful:

**Content Type: `page`**

Fields:

- `title` (Text) - Required
- `slug` (Text) - Required, unique
- `sections` (Array) - Optional
  - Items of type `section` (Object)
    - `id` (Text)
    - `type` (Text) - 'hero' | 'featureGrid' | 'testimonial' | 'cta'
    - `props` (Object) - Dynamic props

**Example page entry in Contentful:**

```json
{
  "title": "Home",
  "slug": "home",
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "props": {
        "title": "Welcome to PageStudio",
        "subtitle": "Edit pages fast"
      }
    }
  ]
}
```

---

## 4. User Roles & Access

### Three roles are defined in `app/actions.ts`:

| Role          | Permissions      | Access                                            |
| ------------- | ---------------- | ------------------------------------------------- |
| **viewer**    | Preview only     | `/dashboard`, `/preview/[slug]`                   |
| **editor**    | Edit draft pages | `/dashboard`, `/preview/[slug]`, `/studio/[slug]` |
| **publisher** | Edit + publish   | All routes + publish button                       |

### Hardcoded users (for development):

```
viewer:     user1@example.com / pass123
viewer:     user2@example.com / pass456
editor:     editor@pagestudio.io / editor789
publisher:  admin@pagestudio.io / admin000
```

---

## 5. Component Flow

### Dashboard Flow:

```
/dashboard/page.tsx (Protected)
  ↓
useAuth() → Check if user exists
  ↓
[Not logged in] → Redirect to /login
[Logged in] → Render <Dashboard />
  ↓
<Dashboard />
  ├─ Fetch pages via fetchDashboardPages(userEmail)
  ├─ Get user role via getUserRole(userEmail)
  ├─ Show page table with actions:
  │  ├─ Preview button → /preview/[slug]
  │  ├─ Edit button → /studio/[slug] (editor+)
  │  └─ Publish button → (publisher only)
  └─ Logout button
```

---

## 6. Data Flow: Contentful → Dashboard

```
1. User logs in → email stored in localStorage
2. Navigate to /dashboard
3. useAuth() reads localStorage → gets user email
4. fetchDashboardPages(email) → Server action
5. Server validates user email → security check
6. contentfulClient.getPages() → Fetches from Contentful
7. Returns PageEntry[] → Renders in <Dashboard />
```

---

## 7. API Responses

### fetchDashboardPages()

```typescript
// Success
{
  success: true,
  pages: PageEntry[]
}

// Error
{
  error: "Unauthorized" | "Failed to fetch pages"
}
```

### PageEntry Type

```typescript
type PageEntry = {
  pageId: string; // Contentful entry ID
  slug: string; // URL slug
  title: string; // Page title
  status: "draft" | "published";
  updatedAt: string; // ISO date
  createdAt: string; // ISO date
  sections: Section[]; // Page content
};
```

---

## 8. Next Steps (Not Implemented Yet)

### For Studio Editor (`/studio/[slug]`):

- Fetch page from Contentful
- Load into Redux state (draftPage slice)
- Show live preview
- Allow editing sections
- Save draft (don't persist until publish)

### For Preview (`/preview/[slug]`):

- Fetch published page from Contentful
- Render sections using registry
- Error boundary for invalid sections
- No editing

### For Publish Flow:

- Compare draft vs published
- Auto-increment semantic version
- Save immutable snapshot
- Generate changelog

---

## 9. Troubleshooting

### Dashboard shows "No pages found"

- ✅ Check Contentful content type ID matches `page` in contentfulClient.ts
- ✅ Verify API key has content delivery permissions
- ✅ Confirm pages are published in Contentful

### "Unauthorized" error

- ✅ Check localStorage has `authUser` key (dev tools → Application)
- ✅ Verify user email is correct in `app/actions.ts`

### Environment variables not loading

- ✅ Restart dev server after adding `.env.local`
- ✅ Prefix with `NEXT_PUBLIC_` for client-side variables
- ✅ Don't commit `.env.local` to git

### Can't connect to Contentful

- ✅ Verify SPACE_ID and ACCESS_TOKEN are correct
- ✅ Check Contentful API key has delivery API access
- ✅ Ensure CONTENTFUL_ENVIRONMENT matches your setup (usually `master`)

---

## 10. Summary of Authentication Flow

```
Landing Page (/page.tsx)
    ↓
  [Login Page] (/login)
    ↓ (Login)
  localStorage.setItem('authUser', email)
    ↓
  [Dashboard] (/dashboard)
    ↓
  useAuth() → reads localStorage
    ↓
  Show pages from Contentful
    ↓ (Logout)
  localStorage.removeItem('authUser')
    ↓
  Redirect to /
```

---

## 11. Security Notes

✅ **What's secure:**

- Passwords never sent to frontend (authenticateUser is server action)
- User email stored in localStorage (not sensitive)
- Contentful API calls happen server-side
- Role checks on server before returning data

⚠️ **What needs improvement for production:**

- Store users in database, not hardcoded
- Use proper auth tokens (JWT/session cookies)
- Hash passwords with bcrypt
- Add rate limiting on login
- Use Contentful management API token securely for publish

---

## Contact Points Summary

| Task              | Where                                | Type             |
| ----------------- | ------------------------------------ | ---------------- |
| Login             | `app/actions.ts`                     | Server Action    |
| Fetch pages       | `app/actions.ts`                     | Server Action    |
| Get user role     | `app/actions.ts`                     | Server Action    |
| Check auth        | `lib/hooks/useAuth.ts`               | Client Hook      |
| Contentful client | `lib/contentful/contentfulClient.ts` | Adapter          |
| Dashboard UI      | `components/Dashboard.tsx`           | Client Component |
| Protected page    | `app/dashboard/page.tsx`             | Client Component |
