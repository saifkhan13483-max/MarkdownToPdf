// In-memory storage interface
// For this MVP, we don't need persistence as conversions are stateless

import type { Feedback } from "@shared/schema";

export interface StoredPdf {
  id: string;
  buffer: Buffer;
  filename: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface StoredFeedback extends Feedback {
  id: string;
  createdAt: Date;
}

export interface IStorage {
  storePdf(buffer: Buffer, filename: string): StoredPdf;
  getPdf(id: string): StoredPdf | undefined;
  cleanupExpiredPdfs(): void;
  storeFeedback(feedback: Feedback): StoredFeedback;
  getAllFeedback(): StoredFeedback[];
}

export class MemStorage implements IStorage {
  private pdfs: Map<string, StoredPdf> = new Map();
  private feedback: StoredFeedback[] = [];
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired PDFs every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredPdfs();
    }, 5 * 60 * 1000);
    // Unref the interval so it doesn't keep the process alive
    this.cleanupInterval.unref();
  }

  storePdf(buffer: Buffer, filename: string): StoredPdf {
    const id = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour expiry

    const storedPdf: StoredPdf = {
      id,
      buffer,
      filename,
      createdAt: now,
      expiresAt,
    };

    this.pdfs.set(id, storedPdf);
    return storedPdf;
  }

  getPdf(id: string): StoredPdf | undefined {
    const pdf = this.pdfs.get(id);
    if (pdf && pdf.expiresAt > new Date()) {
      return pdf;
    }
    // Remove expired PDF
    if (pdf) {
      this.pdfs.delete(id);
    }
    return undefined;
  }

  cleanupExpiredPdfs(): void {
    const now = new Date();
    const entries = Array.from(this.pdfs.entries());
    for (const [id, pdf] of entries) {
      if (pdf.expiresAt <= now) {
        this.pdfs.delete(id);
      }
    }
  }

  private generateId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  storeFeedback(feedback: Feedback): StoredFeedback {
    const storedFeedback: StoredFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
    };
    this.feedback.push(storedFeedback);
    return storedFeedback;
  }

  getAllFeedback(): StoredFeedback[] {
    return [...this.feedback];
  }
}

export const storage = new MemStorage();
