"use client";
import { useState } from "react";
import Login from "./Login";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (showLogin) {
    return (
      <Login
        onSuccess={() => {
          setIsLoggedIn(true);
          setShowLogin(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">PageStudio</h1>
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-8">
          <div>
            <h2 className="text-5xl font-bold text-black mb-4">
              Edit Pages. Fast.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              A lightweight WYSIWYG studio to manage landing pages from
              Contentful. Preview, edit, and publish with confidence.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-gray-200 rounded">
              <h3 className="font-bold text-lg text-black mb-2">Load</h3>
              <p className="text-gray-600 text-sm">
                Pull page definitions directly from Contentful
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded">
              <h3 className="font-bold text-lg text-black mb-2">Edit</h3>
              <p className="text-gray-600 text-sm">
                WYSIWYG editor with real-time preview
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded">
              <h3 className="font-bold text-lg text-black mb-2">Publish</h3>
              <p className="text-gray-600 text-sm">
                Immutable, versioned releases with CI checks
              </p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="mt-12 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700">
                ✓ Logged in. Ready to edit pages.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
