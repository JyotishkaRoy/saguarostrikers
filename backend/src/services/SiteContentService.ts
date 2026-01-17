import { SiteContentDataHelper } from '../data/SiteContentDataHelper.js';
import { BoardMemberDataHelper } from '../data/BoardMemberDataHelper.js';
import { HomepageContent, BoardMember } from '../models/types.js';
import { v4 as uuidv4 } from 'uuid';
import { createError } from '../middleware/errorHandler.js';

export class SiteContentService {
  private siteContentDataHelper: SiteContentDataHelper;
  private boardMemberDataHelper: BoardMemberDataHelper;

  constructor() {
    this.siteContentDataHelper = new SiteContentDataHelper();
    this.boardMemberDataHelper = new BoardMemberDataHelper();
  }

  /**
   * Get homepage content (public)
   */
  async getHomepageContent(): Promise<HomepageContent> {
    return this.siteContentDataHelper.getHomepageContent();
  }

  /**
   * Update homepage content (admin)
   */
  async updateHomepageContent(updates: Partial<HomepageContent>): Promise<HomepageContent> {
    return this.siteContentDataHelper.updateHomepageContent(updates);
  }

  /**
   * Add hero image
   */
  async addHeroImage(imageUrl: string): Promise<HomepageContent> {
    return this.siteContentDataHelper.addHeroImage(imageUrl);
  }

  /**
   * Remove hero image
   */
  async removeHeroImage(imageUrl: string): Promise<HomepageContent> {
    return this.siteContentDataHelper.removeHeroImage(imageUrl);
  }

  /**
   * Set hero images
   */
  async setHeroImages(imageUrls: string[]): Promise<HomepageContent> {
    return this.siteContentDataHelper.setHeroImages(imageUrls);
  }

  /**
   * Get all board members (public shows only active)
   */
  async getAllBoardMembers(activeOnly: boolean = false): Promise<BoardMember[]> {
    if (activeOnly) {
      return this.boardMemberDataHelper.getActiveBoardMembers();
    }
    return this.boardMemberDataHelper.getAll();
  }

  /**
   * Get board member by ID
   */
  async getBoardMemberById(boardMemberId: string): Promise<BoardMember> {
    const member = this.boardMemberDataHelper.getBoardMemberById(boardMemberId);
    
    if (!member) {
      throw createError.notFound('Board member not found');
    }

    return member;
  }

  /**
   * Create board member
   */
  async createBoardMember(data: {
    name: string;
    position: string;
    bio: string;
    imageUrl?: string;
    order?: number;
    status?: 'active' | 'inactive';
  }): Promise<BoardMember> {
    const members = this.boardMemberDataHelper.getAll();
    const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.order)) : -1;

    const boardMember: BoardMember = {
      boardMemberId: uuidv4(),
      name: data.name,
      position: data.position,
      bio: data.bio,
      imageUrl: data.imageUrl,
      order: data.order !== undefined ? data.order : maxOrder + 1,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.boardMemberDataHelper.createBoardMember(boardMember);
  }

  /**
   * Update board member
   */
  async updateBoardMember(
    boardMemberId: string,
    updates: {
      name?: string;
      position?: string;
      bio?: string;
      imageUrl?: string;
      order?: number;
      status?: 'active' | 'inactive';
    }
  ): Promise<BoardMember> {
    const member = this.boardMemberDataHelper.getBoardMemberById(boardMemberId);
    
    if (!member) {
      throw createError.notFound('Board member not found');
    }

    const updatedMember = this.boardMemberDataHelper.updateBoardMember(boardMemberId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedMember) {
      throw createError.internal('Failed to update board member');
    }

    return updatedMember;
  }

  /**
   * Delete board member
   */
  async deleteBoardMember(boardMemberId: string): Promise<void> {
    const member = this.boardMemberDataHelper.getBoardMemberById(boardMemberId);
    
    if (!member) {
      throw createError.notFound('Board member not found');
    }

    const deleted = this.boardMemberDataHelper.deleteBoardMember(boardMemberId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete board member');
    }
  }

  /**
   * Reorder board members
   */
  async reorderBoardMembers(orderedIds: string[]): Promise<void> {
    this.boardMemberDataHelper.reorderBoardMembers(orderedIds);
  }
}
