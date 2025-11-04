import { z } from "zod";

export const pdfOptionsSchema = z.object({
  pageSize: z.enum(["A4", "Letter"]).optional().default("A4"),
  orientation: z.enum(["portrait", "landscape"]).optional().default("portrait"),
  margin: z.number().min(0).max(100).optional().default(20),
  theme: z.enum(["light", "dark", "print"]).optional().default("light"),
  template: z.enum(["minimal", "professional"]).optional().default("minimal"),
});

export const convertMarkdownSchema = z.object({
  markdown: z.string().min(1, "Markdown content is required"),
  filename: z.string().optional().default("document"),
  options: pdfOptionsSchema.optional().default({}),
  action: z.enum(["download", "view", "share"]).optional().default("download"),
});

export const uploadMarkdownResponseSchema = z.object({
  filename: z.string(),
  text: z.string(),
});

export const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "conversion_issue", "other"]),
  message: z.string().min(10, "Please provide at least 10 characters"),
  email: z.string().email().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
});

export type PdfOptions = z.infer<typeof pdfOptionsSchema>;
export type ConvertMarkdownRequest = z.infer<typeof convertMarkdownSchema>;
export type UploadMarkdownResponse = z.infer<typeof uploadMarkdownResponseSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
