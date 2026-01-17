const bcrypt = require('bcryptjs');
const userDataHelper = require('../dataHelpers/userDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class UserService {
  transformUserData(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getAllUsers(requestingUserId, requestInfo = {}) {
    const users = userDataHelper.getAllUsers();
    
    // Log audit
    auditLogDataHelper.createLog({
      userId: requestingUserId,
      action: 'VIEW_ALL_USERS',
      entity: 'user',
      entityId: 'all',
      changes: {},
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return users.map(user => this.transformUserData(user));
  }

  getUserById(userId) {
    const user = userDataHelper.getUserById(userId);
    return this.transformUserData(user);
  }

  async createUser(userData, requestingUserId, requestInfo = {}) {
    const { email, password, firstName, lastName, phone, role, status } = userData;

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
      role: role || 'user',
      status: status || 'active'
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId: requestingUserId,
      action: 'USER_CREATED',
      entity: 'user',
      entityId: newUser.userId,
      changes: { email, firstName, lastName, role, status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return this.transformUserData(newUser);
  }

  async updateUser(userId, updateData, requestingUserId, requestInfo = {}) {
    const user = userDataHelper.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update user
    const updatedUser = userDataHelper.updateUser(userId, updateData);

    // Log audit
    const { password, ...logChanges } = updateData;
    auditLogDataHelper.createLog({
      userId: requestingUserId,
      action: 'USER_UPDATED',
      entity: 'user',
      entityId: userId,
      changes: logChanges,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return this.transformUserData(updatedUser);
  }

  deleteUser(userId, requestingUserId, requestInfo = {}) {
    const user = userDataHelper.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deleting yourself
    if (userId === requestingUserId) {
      throw new Error('You cannot delete your own account');
    }

    const success = userDataHelper.deleteUser(userId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId: requestingUserId,
        action: 'USER_DELETED',
        entity: 'user',
        entityId: userId,
        changes: { email: user.email },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  updateUserStatus(userId, status, requestingUserId, requestInfo = {}) {
    const user = userDataHelper.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent inactivating yourself
    if (userId === requestingUserId && status === 'inactive') {
      throw new Error('You cannot inactivate your own account');
    }

    const updatedUser = userDataHelper.updateUser(userId, { status });

    // Log audit
    auditLogDataHelper.createLog({
      userId: requestingUserId,
      action: 'USER_STATUS_UPDATED',
      entity: 'user',
      entityId: userId,
      changes: { status },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return this.transformUserData(updatedUser);
  }

  getUsersByRole(role) {
    const users = userDataHelper.getUsersByRole(role);
    return users.map(user => this.transformUserData(user));
  }

  getUsersByStatus(status) {
    const users = userDataHelper.getUsersByStatus(status);
    return users.map(user => this.transformUserData(user));
  }
}

module.exports = new UserService();

