const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDataHelper = require('../dataHelpers/userDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class AuthService {
  // Transform data from snake_case to camelCase
  transformUserData(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    };
  }

  async register(userData, requestInfo = {}) {
    const { email, password, firstName, lastName, phone } = userData;

    // Check if user already exists
    const existingUser = userDataHelper.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = userDataHelper.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      role: 'user',
      status: 'active'
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId: newUser.userId,
      action: 'USER_REGISTERED',
      entity: 'user',
      entityId: newUser.userId,
      changes: { email, firstName, lastName },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return this.transformUserData(newUser);
  }

  async login(email, password, requestInfo = {}) {
    // Find user
    const user = userDataHelper.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    userDataHelper.updateLastLogin(user.userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Log audit
    auditLogDataHelper.createLog({
      userId: user.userId,
      action: 'USER_LOGIN',
      entity: 'user',
      entityId: user.userId,
      changes: {},
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return {
      token,
      user: this.transformUserData(user)
    };
  }

  async changePassword(userId, oldPassword, newPassword, requestInfo = {}) {
    const user = userDataHelper.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    userDataHelper.updateUser(userId, { password: hashedPassword });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'PASSWORD_CHANGED',
      entity: 'user',
      entityId: userId,
      changes: {},
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return { message: 'Password changed successfully' };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();

