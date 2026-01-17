import { BaseDataHelper } from './BaseDataHelper.js';
import { User } from '../models/types.js';

export class UserDataHelper extends BaseDataHelper<User> {
  constructor() {
    super('users.json');
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): User | null {
    return this.getById(userId, 'userId');
  }

  /**
   * Get user by email
   */
  public getUserByEmail(email: string): User | null {
    this.loadData();
    return this.data.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Create a new user
   */
  public createUser(userData: User): User {
    return this.add(userData);
  }

  /**
   * Update user by ID
   */
  public updateUser(userId: string, updates: Partial<User>): User | null {
    return this.updateById(userId, 'userId', updates);
  }

  /**
   * Delete user by ID
   */
  public deleteUser(userId: string): boolean {
    return this.deleteById(userId, 'userId');
  }

  /**
   * Get users by role
   */
  public getUsersByRole(role: 'admin' | 'user'): User[] {
    return this.findWhere(user => user.role === role);
  }

  /**
   * Get users by status
   */
  public getUsersByStatus(status: 'active' | 'inactive'): User[] {
    return this.findWhere(user => user.status === status);
  }

  /**
   * Check if email exists
   */
  public emailExists(email: string): boolean {
    this.loadData();
    return this.data.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Get all active users
   */
  public getActiveUsers(): User[] {
    return this.getUsersByStatus('active');
  }

  /**
   * Get all admin users
   */
  public getAdmins(): User[] {
    return this.getUsersByRole('admin');
  }

  /**
   * Update last login timestamp
   */
  public updateLastLogin(userId: string): User | null {
    return this.updateUser(userId, {
      lastLogin: new Date().toISOString()
    });
  }
}
