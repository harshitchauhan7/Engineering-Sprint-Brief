import { z } from 'zod';

// Section Schemas
export const HeroSectionSchema = z.object({
  id: z.string().min(1, 'Section ID required'),
  type: z.literal('hero'),
  props: z.object({
    heading: z.string().min(1, 'Heading required').max(200, 'Heading too long'),
    subheading: z.string().max(300, 'Subheading too long').optional(),
    backgroundImage: z.string().url().optional(),
    ctaText: z.string().max(50, 'CTA text too long').optional(),
    ctaUrl: z.string().url('Invalid URL').optional(),
  }),
});

export const FeatureGridSectionSchema = z.object({
  id: z.string().min(1, 'Section ID required'),
  type: z.literal('featureGrid'),
  props: z.object({
    title: z.string().min(1, 'Title required').max(200, 'Title too long'),
    features: z.array(
      z.object({
        title: z.string().min(1, 'Feature title required'),
        description: z.string().max(300, 'Description too long'),
        icon: z.string().optional(),
      })
    ).min(1, 'At least one feature required').max(6, 'Maximum 6 features'),
  }),
});

export const TestimonialSectionSchema = z.object({
  id: z.string().min(1, 'Section ID required'),
  type: z.literal('testimonial'),
  props: z.object({
    quote: z.string().min(1, 'Quote required').max(500, 'Quote too long'),
    author: z.string().min(1, 'Author required').max(100, 'Author name too long'),
    role: z.string().max(100, 'Role too long').optional(),
    image: z.string().url().optional(),
  }),
});

export const CTASectionSchema = z.object({
  id: z.string().min(1, 'Section ID required'),
  type: z.literal('cta'),
  props: z.object({
    heading: z.string().min(1, 'Heading required').max(200, 'Heading too long'),
    description: z.string().max(300, 'Description too long').optional(),
    buttonText: z.string().min(1, 'Button text required').max(50, 'Button text too long'),
    buttonUrl: z.string().url('Invalid URL'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  }),
});

export const SectionSchema = z.union([
  HeroSectionSchema,
  FeatureGridSectionSchema,
  TestimonialSectionSchema,
  CTASectionSchema,
]);

// Page Schema
export const PageSchema = z.object({
  title: z.string().min(1, 'Page title required').max(200, 'Title too long'),
  slug: z.string()
    .min(1, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens')
    .max(100, 'Slug too long'),
  sections: z.array(SectionSchema).min(1, 'At least one section required').max(20, 'Maximum 20 sections'),
});

export type PageInput = z.infer<typeof PageSchema>;
export type SectionInput = z.infer<typeof SectionSchema>;
