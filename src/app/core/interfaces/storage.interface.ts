/**
 * Interface for storage operations
 * Following Interface Segregation Principle (ISP)
 */
export interface IStorage<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
