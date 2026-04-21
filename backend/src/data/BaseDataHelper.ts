import fs from 'fs';
import path from 'path';
import { getDataDir } from '../config/paths.js';

/**
 * Base class for all data helpers
 * Provides common file I/O operations with error handling
 */
export abstract class BaseDataHelper<T> {
  protected dataPath: string;
  protected data: T[];

  constructor(fileName: string) {
    this.dataPath = path.join(getDataDir(), fileName);
    this.data = [];
    this.loadData();
  }

  /**
   * Load data from JSON file
   */
  protected loadData(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const rawData = fs.readFileSync(this.dataPath, 'utf-8');
        this.data = JSON.parse(rawData) || [];
      } else {
        this.data = [];
        this.saveData();
      }
    } catch (error) {
      console.error(`Error loading data from ${this.dataPath}:`, error);
      this.data = [];
    }
  }

  /**
   * Save data to JSON file
   */
  protected saveData(): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving data to ${this.dataPath}:`, error);
      throw error;
    }
  }

  /**
   * Get all records
   */
  public getAll(): T[] {
    this.loadData();
    return [...this.data];
  }

  /**
   * Get record by ID using a custom key name
   */
  protected getById(id: string, keyName: keyof T): T | null {
    this.loadData();
    return this.data.find(item => (item[keyName] as unknown) === id) || null;
  }

  /**
   * Find records matching a condition
   */
  protected findWhere(predicate: (item: T) => boolean): T[] {
    this.loadData();
    return this.data.filter(predicate);
  }

  /**
   * Add a new record
   */
  protected add(item: T): T {
    this.data.push(item);
    this.saveData();
    return item;
  }

  /**
   * Update a record by ID
   */
  protected updateById(
    id: string,
    keyName: keyof T,
    updates: Partial<T>
  ): T | null {
    this.loadData();
    const index = this.data.findIndex(item => (item[keyName] as unknown) === id);
    
    if (index === -1) {
      return null;
    }

    this.data[index] = { ...this.data[index], ...updates };
    this.saveData();
    return this.data[index];
  }

  /**
   * Delete a record by ID
   */
  protected deleteById(id: string, keyName: keyof T): boolean {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(item => (item[keyName] as unknown) !== id);
    
    if (this.data.length < initialLength) {
      this.saveData();
      return true;
    }
    
    return false;
  }

  /**
   * Count total records
   */
  public count(): number {
    this.loadData();
    return this.data.length;
  }

  /**
   * Count records matching a condition
   */
  protected countWhere(predicate: (item: T) => boolean): number {
    this.loadData();
    return this.data.filter(predicate).length;
  }

  /**
   * Check if record exists by ID
   */
  protected exists(id: string, keyName: keyof T): boolean {
    this.loadData();
    return this.data.some(item => (item[keyName] as unknown) === id);
  }

  /**
   * Clear all data (use with caution!)
   */
  protected clearAll(): void {
    this.data = [];
    this.saveData();
  }
}
