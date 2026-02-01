import { SiteContentDataHelper } from '../data/SiteContentDataHelper.js';
import { BoardMemberDataHelper } from '../data/BoardMemberDataHelper.js';
import { HomepageContent, BoardMember, JoinMissionAgreements, FutureExplorersContent, FutureExplorersCarouselImage } from '../models/types.js';
import { generateId } from '../utils/idGenerator.js';
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
   * Get Join Mission agreement texts (public)
   */
  async getJoinMissionAgreements(): Promise<JoinMissionAgreements> {
    return this.siteContentDataHelper.getJoinMissionAgreements();
  }

  /**
   * Update Join Mission agreement texts (admin)
   */
  async updateJoinMissionAgreements(updates: Partial<JoinMissionAgreements>): Promise<JoinMissionAgreements> {
    return this.siteContentDataHelper.updateJoinMissionAgreements(updates);
  }

  /**
   * Get Future Explorers page content (public)
   */
  async getFutureExplorersContent(): Promise<FutureExplorersContent> {
    return this.siteContentDataHelper.getFutureExplorersContent();
  }

  /**
   * Update Future Explorers content (admin) – publishes immediately
   */
  async updateFutureExplorersContent(updates: Partial<FutureExplorersContent>): Promise<FutureExplorersContent> {
    return this.siteContentDataHelper.updateFutureExplorersContent(updates);
  }

  /**
   * Add carousel image to Future Explorers (admin)
   */
  async addFutureExplorersCarouselImage(url: string, sequence?: number): Promise<FutureExplorersContent> {
    const content = this.siteContentDataHelper.getFutureExplorersContent();
    const images = content.carouselImages ?? [];
    const maxSeq = images.length > 0 ? Math.max(...images.map((i) => i.sequence)) : -1;
    const image: FutureExplorersCarouselImage = {
      imageId: generateId(),
      url,
      sequence: sequence ?? maxSeq + 1,
      active: true,
    };
    return this.siteContentDataHelper.addFutureExplorersCarouselImage(image);
  }

  /**
   * Update carousel image (sequence, active) (admin)
   */
  async updateFutureExplorersCarouselImage(
    imageId: string,
    updates: Partial<Pick<FutureExplorersCarouselImage, 'sequence' | 'active'>>
  ): Promise<FutureExplorersContent | null> {
    return this.siteContentDataHelper.updateFutureExplorersCarouselImage(imageId, updates);
  }

  /**
   * Remove carousel image (admin)
   */
  async removeFutureExplorersCarouselImage(imageId: string): Promise<FutureExplorersContent> {
    return this.siteContentDataHelper.removeFutureExplorersCarouselImage(imageId);
  }

  /**
   * Reorder carousel images (admin)
   */
  async setFutureExplorersCarouselOrder(orderedImages: FutureExplorersCarouselImage[]): Promise<FutureExplorersContent> {
    return this.siteContentDataHelper.setFutureExplorersCarouselOrder(orderedImages);
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
    email: string;
    imageUrl?: string;
    order?: number;
    status?: 'active' | 'inactive';
  }): Promise<BoardMember> {
    const members = this.boardMemberDataHelper.getAll();
    const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.order)) : -1;

    const boardMember: BoardMember = {
      boardMemberId: generateId(),
      name: data.name,
      position: data.position,
      bio: data.bio,
      email: data.email,
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
      email?: string;
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
