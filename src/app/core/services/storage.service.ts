import { Injectable } from '@angular/core';
import { IStorage } from '../interfaces/storage.interface';

/**
 * Storage Service implementing IStorage interface
 * Following Single Responsibility Principle (SRP)
 * Handles local storage operations
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService<T> implements IStorage<T> {

  get(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  set(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
