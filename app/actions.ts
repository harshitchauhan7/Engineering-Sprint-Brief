// app/actions.ts
"use server";
import { getPages, getPageBySlug } from "@/lib/contentful/contentfulClient";

const USERS = [
  { email: "user1@example.com", password: "pass123", role: "viewer" },
  { email: "user2@example.com", password: "pass456", role: "viewer" },
  { email: "editor@pagestudio.io", password: "editor789", role: "editor" },
  { email: "admin@pagestudio.io", password: "admin000", role: "publisher" },
] as const;

export type UserRole = "viewer" | "editor" | "publisher";

export type AuthResult = {
  success: boolean;
  email?: string;
  role?: UserRole;
  error?: string;
};

/**
 * Authenticate user (existing logic + role)
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  // Simulate a quick DB look-up delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = USERS.find((u) => u.email === email && u.password === password);

  if (user) {
    return {
      success: true,
      email: user.email,
      role: user.role,
    };
  }

  return { success: false, error: "Invalid email or password" };
}

/**
 * Fetch all pages from Contentful
 * Only callable from authenticated users
 */
export async function fetchDashboardPages(userEmail: string | null) {
  // Security: Only authenticated users can fetch pages
  if (!userEmail) {
    return { error: "Unauthorized" };
  }

  try {
    const pages = await getPages(false); // false = published only
    return { success: true, pages };
  } catch (error) {
    return { error: "Failed to fetch pages" };
  }
}

/**
 * Fetch a single page by slug
 */
export async function fetchPageBySlug(
  slug: string,
  preview: boolean = false,
  userEmail: string | null = null,
) {
  // For preview, require authentication
  if (preview && !userEmail) {
    return { error: "Unauthorized" };
  }

  try {
    const page = await getPageBySlug(slug, preview);
    if (!page) {
      return { error: "Page not found" };
    }
    return { success: true, page };
  } catch (error) {
    return { error: "Failed to fetch page" };
  }
}

/**
 * Get user role by email
 */
export async function getUserRole(email: string): Promise<UserRole | null> {
  const user = USERS.find((u) => u.email === email);
  return user?.role || null;
}
