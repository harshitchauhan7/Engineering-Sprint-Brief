"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createPage, validatePageSlug } from "@/app/actions/pageActions";
import { PageInput, SectionInput } from "@/lib/validation/pageSchema";
import { v4 as uuidv4 } from "uuid";

type ValidationError = {
  field: string;
  message: string;
};

const defaultProps: Record<string, any> = {
  hero: {
    heading: "",
    subheading: "",
    backgroundImage: "",
    ctaText: "",
    ctaUrl: "",
  },
  featureGrid: {
    title: "",
    features: [],
  },
  testimonial: {
    quote: "",
    author: "",
    role: "",
    image: "",
  },
  cta: {
    heading: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    backgroundColor: "#000000",
  },
};

export function CreateWebPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({ title: "", slug: "" });

  const [sections, setSections] = useState<SectionInput[]>([
    {
      id: uuidv4(),
      type: "hero",
      props: { ...defaultProps.hero },
    },
  ]);

  const [activeSection, setActiveSection] = useState(0);

  const clearError = useCallback(() => {
    setTimeout(() => setErrors([]), 5000);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSlugBlur = useCallback(async () => {
    if (!formData.slug) return;
    const result = await validatePageSlug(formData.slug, user);
    if (!result.available) {
      setErrors((prev) => [
        ...prev,
        { field: "slug", message: result.error || "Slug unavailable" },
      ]);
      clearError();
    }
  }, [formData.slug, user, clearError]);

  const updateSectionProp = useCallback(
    (sectionIndex: number, propName: string, value: any) => {
      setSections((prev) =>
        prev.map((section, idx) => {
          if (idx !== sectionIndex) return section;
          return {
            ...section,
            props: { ...section.props, [propName]: value },
          } as SectionInput;
        }),
      );
    },
    [],
  );

  // Add a new section of a specific type
  const addSection = useCallback((type: SectionInput["type"]) => {
    const newSection: SectionInput = {
      id: uuidv4(),
      type,
      props: { ...defaultProps[type] },
    };
    setSections((prev) => {
      const next = [...prev, newSection];
      setActiveSection(next.length - 1);
      return next;
    });
  }, []);

  const removeSection = useCallback(
    (sectionIndex: number) => {
      setSections((prev) => {
        if (prev.length === 1) {
          setErrors([
            { field: "sections", message: "Must have at least one section" },
          ]);
          clearError();
          return prev;
        }
        const next = prev.filter((_, idx) => idx !== sectionIndex);
        setActiveSection((active) => Math.min(active, next.length - 1));
        return next;
      });
    },
    [clearError],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    console.log(JSON.stringify(sections, null, 2));
    try {
      const result = await createPage(
        { title: formData.title, slug: formData.slug, sections },
        user,
      );
      if (result.success) {
        setSuccessMessage("✓ Page created successfully!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setErrors([
          {
            field: "general",
            message: result.error || "Failed to create page",
          },
        ]);
        clearError();
      }
    } catch {
      setErrors([
        { field: "general", message: "An unexpected error occurred" },
      ]);
      clearError();
    } finally {
      setLoading(false);
    }
  };

  const currentSection = sections[activeSection];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black">Create New Page</h1>
              <p className="text-sm text-gray-500 mt-1">
                Design your landing page
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Page Metadata */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4">
                  Page Details
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., My Awesome Landing Page"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Page Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleFormChange}
                    onBlur={handleSlugBlur}
                    placeholder="e.g., my-awesome-page"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lowercase letters, numbers, and hyphens only. Used in URL:
                    /page/
                    {formData.slug}
                  </p>
                </div>
              </div>

              {/* Sections Editor */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4">
                  Sections
                </h2>

                {/* Section Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
                  {sections.map((section, idx) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(idx)}
                      className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
                        activeSection === idx
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {section.type} #{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Active Section Editor */}
                {currentSection && (
                  <SectionEditor
                    key={`${currentSection.id}-${activeSection}`}
                    section={currentSection}
                    sectionIndex={activeSection}
                    onUpdateProp={updateSectionProp}
                    onRemove={removeSection}
                    canRemove={sections.length > 1}
                  />
                )}

                {/* Add Section Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    Add a new section:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addSection("hero")}
                      className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm font-medium hover:bg-blue-100 transition"
                    >
                      + Hero
                    </button>
                    <button
                      type="button"
                      onClick={() => addSection("featureGrid")}
                      className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-sm font-medium hover:bg-purple-100 transition"
                    >
                      + Feature Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => addSection("testimonial")}
                      className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium hover:bg-green-100 transition"
                    >
                      + Testimonial
                    </button>
                    <button
                      type="button"
                      onClick={() => addSection("cta")}
                      className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded text-sm font-medium hover:bg-orange-100 transition"
                    >
                      + CTA
                    </button>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    ⚠ Format Errors:
                  </p>
                  <ul className="space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition text-sm"
                >
                  {loading ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - Quick Guide */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-black mb-4">
                📋 Quick Guide
              </h3>
              <div className="space-y-4 text-xs text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Hero Section</p>
                  <p>Large banner with heading and optional CTA button</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Feature Grid</p>
                  <p>Display up to 6 features with titles and descriptions</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Testimonial</p>
                  <p>Customer quote with author details</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">CTA Section</p>
                  <p>Call-to-action with custom button</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">Validation</p>
                  <p>
                    Fields marked with * are required. Errors appear in
                    real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Section Editor — no dropdown, no type switching, just the fields for the section's type
interface SectionEditorProps {
  section: SectionInput;
  sectionIndex: number;
  onUpdateProp: (sectionIndex: number, propName: string, value: any) => void;
  onRemove: (sectionIndex: number) => void;
  canRemove: boolean;
}

function SectionEditor({
  section,
  sectionIndex,
  onUpdateProp,
  onRemove,
  canRemove,
}: SectionEditorProps) {
  const props = section.props as Record<string, any>;

  return (
    <div className="space-y-4">
      {/* Section Header with Remove button */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 capitalize">
          {section.type === "featureGrid"
            ? "Feature Grid"
            : section.type.charAt(0).toUpperCase() + section.type.slice(1)}{" "}
          Section
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(sectionIndex)}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Hero Fields */}
      {section.type === "hero" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Heading *
            </label>
            <input
              type="text"
              placeholder="Enter heading"
              value={props.heading || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "heading", e.target.value)
              }
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(props.heading || "").length}/200
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Subheading
            </label>
            <input
              type="text"
              placeholder="Enter subheading (optional)"
              value={props.subheading || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "subheading", e.target.value)
              }
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(props.subheading || "").length}/300
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Background Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={props.backgroundImage || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "backgroundImage", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-xs font-semibold text-gray-900 mb-3">
              Call-to-Action Button
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Button text (Required)"
                value={props.ctaText || ""}
                onChange={(e) =>
                  onUpdateProp(sectionIndex, "ctaText", e.target.value)
                }
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="url"
                placeholder="Button URL (Required)"
                value={props.ctaUrl || ""}
                onChange={(e) =>
                  onUpdateProp(sectionIndex, "ctaUrl", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Feature Grid Fields */}
      {section.type === "featureGrid" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Grid Title *
            </label>
            <input
              type="text"
              placeholder="Enter grid title"
              value={props.title || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "title", e.target.value)
              }
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium text-gray-700">
                Features ({(props.features || []).length}/6)
              </p>
              {(props.features || []).length < 6 && (
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = [
                      ...(props.features || []),
                      { title: "", description: "", icon: "" },
                    ];
                    onUpdateProp(sectionIndex, "features", newFeatures);
                  }}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add Feature
                </button>
              )}
            </div>
            {(props.features || []).map((feature: any, idx: number) => (
              <div
                key={idx}
                className="mb-3 p-3 bg-white border border-gray-200 rounded space-y-2"
              >
                <input
                  type="text"
                  placeholder="Feature Title *"
                  value={feature.title || ""}
                  onChange={(e) => {
                    const newFeatures = [...(props.features || [])];
                    newFeatures[idx] = { ...feature, title: e.target.value };
                    onUpdateProp(sectionIndex, "features", newFeatures);
                  }}
                  maxLength={100}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Feature Description"
                  value={feature.description || ""}
                  onChange={(e) => {
                    const newFeatures = [...(props.features || [])];
                    newFeatures[idx] = {
                      ...feature,
                      description: e.target.value,
                    };
                    onUpdateProp(sectionIndex, "features", newFeatures);
                  }}
                  maxLength={300}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = (props.features || []).filter(
                      (_: any, i: number) => i !== idx,
                    );
                    onUpdateProp(sectionIndex, "features", newFeatures);
                  }}
                  className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Remove Feature
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial Fields */}
      {section.type === "testimonial" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Testimonial Quote *
            </label>
            <textarea
              placeholder="Enter the testimonial quote"
              value={props.quote || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "quote", e.target.value)
              }
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(props.quote || "").length}/500
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              placeholder="Enter author name"
              value={props.author || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "author", e.target.value)
              }
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Author Role
            </label>
            <input
              type="text"
              placeholder="e.g., CEO at Company (optional)"
              value={props.role || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "role", e.target.value)
              }
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Author Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg (Required)"
              value={props.image || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "image", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* CTA Fields */}
      {section.type === "cta" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              CTA Heading *
            </label>
            <input
              type="text"
              placeholder="Enter heading"
              value={props.heading || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "heading", e.target.value)
              }
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter description (optional)"
              value={props.description || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "description", e.target.value)
              }
              maxLength={300}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Button Text *
            </label>
            <input
              type="text"
              placeholder="e.g., Get Started"
              value={props.buttonText || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "buttonText", e.target.value)
              }
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Button URL *
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={props.buttonUrl || ""}
              onChange={(e) =>
                onUpdateProp(sectionIndex, "buttonUrl", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Background Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={props.backgroundColor || "#000000"}
                onChange={(e) =>
                  onUpdateProp(sectionIndex, "backgroundColor", e.target.value)
                }
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-600">
                {props.backgroundColor || "#000000"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
