import { Response } from 'express';
import { AuthRequest, BoardMember } from '../../models/types.js';
import { BoardMemberDataHelper } from '../../data/BoardMemberDataHelper.js';
import { generateId } from '../../utils/idGenerator.js';

export class BoardMemberAdminController {
  private boardMemberDataHelper: BoardMemberDataHelper;

  constructor() {
    this.boardMemberDataHelper = new BoardMemberDataHelper();
  }

  /**
   * Get all board members (including inactive)
   */
  async getAllBoardMembers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const boardMembers = this.boardMemberDataHelper.getAll();
      res.status(200).json({ success: true, data: boardMembers });
    } catch (error) {
      console.error('Error fetching board members:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch board members' });
    }
  }

  /**
   * Get a single board member by ID
   */
  async getBoardMemberById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const boardMember = this.boardMemberDataHelper.getBoardMemberById(id);

      if (!boardMember) {
        res.status(404).json({ success: false, message: 'Board member not found' });
        return;
      }

      res.status(200).json({ success: true, data: boardMember });
    } catch (error) {
      console.error('Error fetching board member:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch board member' });
    }
  }

  /**
   * Create a new board member
   */
  async createBoardMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, position, bio, email, imageUrl } = req.body;

      if (!name || !position || !bio || !email) {
        res.status(400).json({ 
          success: false, 
          message: 'Name, position, bio, and email are required' 
        });
        return;
      }

      // Get the highest order number and add 1
      const allMembers = this.boardMemberDataHelper.getAll();
      const maxOrder = allMembers.length > 0 
        ? Math.max(...allMembers.map(m => m.order)) 
        : 0;

      const newBoardMember: BoardMember = {
        boardMemberId: generateId(),
        name,
        position,
        bio,
        email,
        imageUrl: imageUrl || '',
        order: maxOrder + 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = this.boardMemberDataHelper.createBoardMember(newBoardMember);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error('Error creating board member:', error);
      res.status(500).json({ success: false, message: 'Failed to create board member' });
    }
  }

  /**
   * Update a board member
   */
  async updateBoardMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existingMember = this.boardMemberDataHelper.getBoardMemberById(id);
      if (!existingMember) {
        res.status(404).json({ success: false, message: 'Board member not found' });
        return;
      }

      const updatedMember = this.boardMemberDataHelper.updateBoardMember(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({ success: true, data: updatedMember });
    } catch (error) {
      console.error('Error updating board member:', error);
      res.status(500).json({ success: false, message: 'Failed to update board member' });
    }
  }

  /**
   * Delete a board member
   */
  async deleteBoardMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existingMember = this.boardMemberDataHelper.getBoardMemberById(id);
      if (!existingMember) {
        res.status(404).json({ success: false, message: 'Board member not found' });
        return;
      }

      const deleted = this.boardMemberDataHelper.deleteBoardMember(id);
      
      if (deleted) {
        res.status(200).json({ success: true, message: 'Board member deleted successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete board member' });
      }
    } catch (error) {
      console.error('Error deleting board member:', error);
      res.status(500).json({ success: false, message: 'Failed to delete board member' });
    }
  }

  /**
   * Reorder board members
   */
  async reorderBoardMembers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }

      this.boardMemberDataHelper.reorderBoardMembers(orderedIds);
      res.status(200).json({ success: true, message: 'Board members reordered successfully' });
    } catch (error) {
      console.error('Error reordering board members:', error);
      res.status(500).json({ success: false, message: 'Failed to reorder board members' });
    }
  }

  /**
   * Upload board member image
   */
  async uploadBoardMemberImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file uploaded' });
        return;
      }

      const imageUrl = `/uploads/mission-leaders/${req.file.filename}`;
      res.status(200).json({ success: true, data: { url: imageUrl } });
    } catch (error) {
      console.error('Error uploading board member image:', error);
      res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
  }
}
