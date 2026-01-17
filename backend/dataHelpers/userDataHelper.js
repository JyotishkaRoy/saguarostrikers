const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class UserDataHelper {
  getAllUsers() {
    return readDB(DB_FILES.USERS);
  }

  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.userId === userId);
  }

  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const users = this.getAllUsers();
    const newUser = {
      userId: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    writeDB(DB_FILES.USERS, users);
    return newUser;
  }

  updateUser(userId, updateData) {
    const users = this.getAllUsers();
    const index = users.findIndex(user => user.userId === userId);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    writeDB(DB_FILES.USERS, users);
    return users[index];
  }

  deleteUser(userId) {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.userId !== userId);
    
    if (users.length === filteredUsers.length) return false;
    
    writeDB(DB_FILES.USERS, filteredUsers);
    return true;
  }

  updateLastLogin(userId) {
    return this.updateUser(userId, { lastLogin: new Date().toISOString() });
  }

  getUsersByStatus(status) {
    const users = this.getAllUsers();
    return users.filter(user => user.status === status);
  }

  getUsersByRole(role) {
    const users = this.getAllUsers();
    return users.filter(user => user.role === role);
  }
}

module.exports = new UserDataHelper();

