// In-memory storage interface
// For this MVP, we don't need persistence as conversions are stateless

export interface IStorage {
  // Future: add conversion history tracking if needed
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
