import bcrypt from 'bcryptjs';
import { generateId } from '../utils/idGenerator.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { User, CreateUserData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';

export class UserService {
  private userDataHelper: UserDataHelper;

  constructor() {
    this.userDataHelper = new UserDataHelper();
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = this.userDataHelper.getAll();
    return users.map(({ password: _, ...user }) => user);
  }

  /**
   * Get active users only (for participant dropdowns, etc.)
   */
  async getActiveUsers(): Promise<Omit<User, 'password'>[]> {
    const users = this.userDataHelper.getActiveUsers();
    return users.map(({ password: _, ...user }) => user);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'>> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: CreateUserData): Promise<Omit<User, 'password'>> {
    // Check if email already exists
    if (this.userDataHelper.emailExists(data.email)) {
      throw createError.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user: User = {
      userId: generateId(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'user',
      status: data.status || 'active',
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdUser = this.userDataHelper.createUser(user);
    const { password: _, ...userWithoutPassword } = createdUser;
    
    return userWithoutPassword;
  }

  /**
   * Update user (admin only)
   */
  async updateUser(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: 'admin' | 'user';
      status?: 'active' | 'inactive';
    }
  ): Promise<Omit<User, 'password'>> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    const updatedUser = this.userDataHelper.updateUser(userId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedUser) {
      throw createError.internal('Failed to update user');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    const deleted = this.userDataHelper.deleteUser(userId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete user');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'user'): Promise<Omit<User, 'password'>[]> {
    const users = this.userDataHelper.getUsersByRole(role);
    return users.map(({ password: _, ...user }) => user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = this.userDataHelper.getUserByEmail(email);
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleUserStatus(userId: string): Promise<Omit<User, 'password'>> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    const updatedUser = this.userDataHelper.updateUser(userId, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    if (!updatedUser) {
      throw createError.internal('Failed to toggle user status');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw createError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    this.userDataHelper.updateUser(userId, {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    // Base upload directory (project root)
    const uploadsBase = path.join(process.cwd(), '..', 'uploads');
    const userDir = path.join(uploadsBase, 'users', userId);

    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
      console.log(`📁 Created user folder: ${userId}`);
    }

    // Delete any existing files in the user folder (only keep one profile image)
    const existingFiles = fs.readdirSync(userDir);
    existingFiles.forEach(existingFile => {
      const filePath = path.join(userDir, existingFile);
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted old profile image: ${existingFile}`);
    });

    // Save new file
    const fileExt = path.extname(file.originalname);
    const fileName = `profile${fileExt}`;
    const targetPath = path.join(userDir, fileName);

    // Move from temp to user folder
    fs.renameSync(file.path, targetPath);

    // Generate URL
    const imageUrl = `/uploads/users/${userId}/${fileName}`;
    
    console.log(`✅ Profile image uploaded: ${imageUrl}`);

    // Update user record with image URL
    this.userDataHelper.updateUser(userId, {
      profileImageUrl: imageUrl,
      updatedAt: new Date().toISOString()
    });

    return imageUrl;
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    this.userDataHelper.updateUser(userId, {
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
  }
}
