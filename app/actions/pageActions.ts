"use server";

import { PageSchema, PageInput } from "@/lib/validation/pageSchema";
import { ZodError } from "zod";
import { createClient as createManagementClient } from "contentful-management";

// ✅ Lazy getter — runs at call time, not module load time
function getManagementClient() {
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  console.log("access toen", accessToken);
  if (!accessToken) {
    throw new Error("Missing env: CONTENTFUL_MANAGEMENT_TOKEN is not set");
  }

  return createManagementClient({ accessToken });
}

export async function createPage(
  data: PageInput,
  userEmail: string | null,
): Promise<{ success: boolean; error?: string; pageId?: string }> {
  if (!userEmail) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = PageSchema.parse(data);

    // ✅ Client created here, not at module scope
    const client = getManagementClient();

    const entry = await client.entry.create(
      {
        spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || "",
        environmentId: process.env.CONTENTFUL_ENVIRONMENT || "master",
        contentTypeId: "page",
      },
      {
        fields: {
          title: { "en-US": validatedData.title },
          slug: { "en-US": validatedData.slug },
          sections: {
            "en-US": validatedData.sections.map((section) => ({
              id: section.id,
              type: section.type,
              props: section.props,
            })),
          },
        },
      },
    );

    console.log("Page created in Contentful:", entry.sys.id);
    return { success: true, pageId: entry.sys.id };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `Validation error: ${firstError.message} (${firstError.path.join(".")})`,
      };
    }

    if (error instanceof Error) {
      if (error.message.includes("ValidationFailed")) {
        return {
          success: false,
          error: "A page with this slug already exists.",
        };
      }
      console.error("Contentful API error:", error.message);
      return { success: false, error: `Contentful error: ${error.message}` };
    }

    return { success: false, error: "Failed to create page" };
  }
}
export async function validatePageSlug(
  slug: string,
  userEmail: string | null,
): Promise<{ available: boolean; error?: string }> {
  if (!userEmail) {
    return { available: false, error: "Unauthorized" };
  }

  // TODO: Check Contentful for existing slug
  // For now, simulate availability check
  const reserved = ["dashboard", "studio", "preview", "login", "api"];
  if (reserved.includes(slug)) {
    return { available: false, error: "Slug is reserved" };
  }

  return { available: true };
}
