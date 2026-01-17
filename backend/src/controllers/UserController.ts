import { Response } from 'express';
import { UserService } from '../services/UserService.js';
import { AuthRequest } from '../models/types.js';
import { ApiError } from '../middleware/errorHandler.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
      }
    }
  }

  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create user' });
      }
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);
      res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update user' });
      }
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
      }
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.toggleUserStatus(id);
      res.status(200).json({ success: true, message: 'User status updated', data: user });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to toggle user status' });
      }
    }
  }
}
