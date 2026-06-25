// lib/contentful/contentfulClient.ts
import { createClient } from 'contentful';

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

const previewClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
  host: 'preview.contentful.com',
});

export type PageEntry = {
  pageId: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  updatedAt: string;
  createdAt: string;
  sections: Array<{
    id: string;
    type: 'hero' | 'featureGrid' | 'testimonial' | 'cta';
    props: Record<string, unknown>;
  }>;
};

/**
 * Fetch all pages from Contentful
 * @param preview - If true, fetch draft content; else published
 */
export async function getPages(preview: boolean = false): Promise<PageEntry[]> {
  try {
    const contentClient = preview ? previewClient : client;

    const entries = await contentClient.getEntries({
      content_type: 'page', // Adjust to your content type ID
      limit: 100,
    });

    return entries.items.map((entry: any) => ({
      pageId: entry.sys.id,
      slug: entry.fields.slug || '',
      title: entry.fields.title || 'Untitled',
      status: entry.sys.publishedVersion ? 'published' : 'draft',
      updatedAt: entry.sys.updatedAt || new Date().toISOString(),
      createdAt: entry.sys.createdAt || new Date().toISOString(),
      sections: entry.fields.sections || [],
    }));
  } catch (error) {
    console.error('Error fetching pages from Contentful:', error);
    return [];
  }
}

/**
 * Fetch a single page by slug
 */
export async function getPageBySlug(
  slug: string,
  preview: boolean = false
): Promise<PageEntry | null> {
  try {
    const contentClient = preview ? previewClient : client;

    const entries = await contentClient.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) return null;

    const entry = entries.items[0] as any;

    return {
      pageId: entry.sys.id,
      slug: entry.fields.slug || '',
      title: entry.fields.title || 'Untitled',
      status: entry.sys.publishedVersion ? 'published' : 'draft',
      updatedAt: entry.sys.updatedAt || new Date().toISOString(),
      createdAt: entry.sys.createdAt || new Date().toISOString(),
      sections: entry.fields.sections || [],
    };
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

/**
 * Publish a page (move from draft to published)
 * Note: Requires management API token
 */
export async function publishPage(pageId: string): Promise<boolean> {
  try {
    // This would use the management client
    // For now, placeholder - you'll implement this later
    console.log(`Publishing page ${pageId}`);
    return true;
  } catch (error) {
    console.error(`Error publishing page:`, error);
    return false;
  }
}
