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
});

export const uploadMarkdownResponseSchema = z.object({
  filename: z.string(),
  text: z.string(),
});

export type PdfOptions = z.infer<typeof pdfOptionsSchema>;
export type ConvertMarkdownRequest = z.infer<typeof convertMarkdownSchema>;
export type UploadMarkdownResponse = z.infer<typeof uploadMarkdownResponseSchema>;
