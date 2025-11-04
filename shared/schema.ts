import { z } from "zod";

export const convertMarkdownSchema = z.object({
  markdown: z.string().min(1, "Markdown content is required"),
  filename: z.string().optional().default("document"),
});

export const uploadMarkdownResponseSchema = z.object({
  filename: z.string(),
  text: z.string(),
});

export type ConvertMarkdownRequest = z.infer<typeof convertMarkdownSchema>;
export type UploadMarkdownResponse = z.infer<typeof uploadMarkdownResponseSchema>;
