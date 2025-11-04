import { z } from "zod";

export const convertMarkdownSchema = z.object({
  markdown: z.string().min(1, "Markdown content is required"),
  filename: z.string().optional().default("document"),
});

export type ConvertMarkdownRequest = z.infer<typeof convertMarkdownSchema>;
