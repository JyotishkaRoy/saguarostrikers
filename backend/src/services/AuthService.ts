import bcrypt from 'bcryptjs';
import { generateId } from '../utils/idGenerator.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { generateToken } from '../middleware/auth.js';
import { User, LoginResponse, RegisterUserData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class AuthService {
  private userDataHelper: UserDataHelper;

  constructor() {
    this.userDataHelper = new UserDataHelper();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterUserData): Promise<LoginResponse> {
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
      role: 'user',
      status: 'active',
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdUser = this.userDataHelper.createUser(user);

    // Generate token
    const token = generateToken(createdUser.userId, createdUser.email, createdUser.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = createdUser;

    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = this.userDataHelper.getUserByEmail(email);
    
    if (!user) {
      throw createError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw createError.forbidden('Account is inactive. Please contact admin.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw createError.unauthorized('Invalid email or password');
    }

    // Update last login
    this.userDataHelper.updateLastLogin(user.userId);

    // Generate token
    const token = generateToken(user.userId, user.email, user.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
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
      throw createError.internal('Failed to update profile');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = this.userDataHelper.getUserById(userId);
    
    if (!user) {
      throw createError.notFound('User not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
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
}
