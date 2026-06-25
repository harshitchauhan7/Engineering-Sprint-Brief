"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchDashboardPages } from "@/app/actions";

type Page = {
  pageId: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
  createdAt: string;
  sections: Array<{
    id: string;
    type: "hero" | "featureGrid" | "testimonial" | "cta";
    props: Record<string, unknown>;
  }>;
};

export function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<
    "viewer" | "editor" | "publisher" | null
  >(null);

  // Protect route and load data
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // Extract role from localStorage (set during login)
      const storedRole = localStorage.getItem("authRole") as
        | "viewer"
        | "editor"
        | "publisher"
        | null;
      setUserRole(storedRole || "viewer");
      console.log("Stored roe is", localStorage.getItem("authRole"));
      // Load pages
      loadPages();
    }
  }, [user, loading, router]);

  const loadPages = async () => {
    setDashboardLoading(true);
    setError(null);

    const result = await fetchDashboardPages(user);

    if (result.error) {
      setError(result.error);
    } else if (result.pages) {
      setPages(result.pages);
    }

    setDashboardLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">PageStudio</h1>
            <p className="text-sm text-gray-500 mt-1">Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Title Section with Create Button */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-black">Your Pages</h2>
              <p className="text-gray-600 text-sm mt-1">
                Manage and edit your landing pages
              </p>
            </div>
            {(userRole === "editor" || userRole === "publisher") && (
              <Link
                href="/create-page"
                className="px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition text-sm flex items-center gap-2"
              >
                <span>+</span> Create New Page
              </Link>
            )}
          </div>

          {/* Loading State */}
          {dashboardLoading && (
            <div className="p-8 bg-white border border-gray-200 rounded text-center">
              <p className="text-gray-600">Loading pages...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-red-600 text-xs mt-2">
                Make sure your Contentful credentials are configured in
                .env.local
              </p>
            </div>
          )}

          {/* Pages Table */}
          {!dashboardLoading && pages.length > 0 && (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-black">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-black">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr
                      key={page.pageId}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium text-black">{page.title}</p>
                      </td>
                      <td className="px-6 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                              page.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {page.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {formatDate(page.updatedAt)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          {/* Preview Button */}
                          <Link
                            href={`/preview/${page.slug}`}
                            className="px-3 py-2 bg-gray-200 text-gray-900 rounded text-xs font-medium hover:bg-gray-300 transition"
                          >
                            Preview
                          </Link>

                          {/* Studio Button (editors + publishers only) */}
                          {(userRole === "editor" ||
                            userRole === "publisher") && (
                            <Link
                              href={`/studio/${page.slug}`}
                              className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Publish Button (publishers only) */}
                          {userRole === "publisher" && (
                            <button
                              className={`px-3 py-2 rounded text-xs font-medium transition ${
                                page.status === "published"
                                  ? "bg-green-100 text-green-800 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                              disabled={page.status === "published"}
                            >
                              {page.status === "published"
                                ? "Published"
                                : "Publish"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!dashboardLoading && pages.length === 0 && !error && (
            <div className="p-12 bg-white border border-gray-200 rounded text-center">
              <p className="text-gray-600 mb-4">No pages found in Contentful</p>
              <p className="text-sm text-gray-500 mb-6">
                Create a page in Contentful or use the button above to get
                started.
              </p>
              {(userRole === "editor" || userRole === "publisher") && (
                <Link
                  href="/create"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition text-sm"
                >
                  Create Your First Page
                </Link>
              )}
            </div>
          )}

          {/* Viewer Notice */}
          {userRole === "viewer" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-700 text-sm">
                💡 As a viewer, you can preview pages but cannot edit or publish
                them.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
