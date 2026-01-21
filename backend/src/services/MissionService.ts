import { generateId } from '../utils/idGenerator.js';
import fs from 'fs';
import path from 'path';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { Mission, SubEvent, CreateMissionData, UpdateMissionData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class MissionService {
  private missionDataHelper: MissionDataHelper;
  private subEventDataHelper: SubEventDataHelper;

  constructor() {
    this.missionDataHelper = new MissionDataHelper();
    this.subEventDataHelper = new SubEventDataHelper();
  }

  /**
   * Get all missions
   */
  async getAllMissions(): Promise<Mission[]> {
    return this.missionDataHelper.getAll();
  }

  /**
   * Get published missions (public)
   */
  async getPublishedMissions(): Promise<Mission[]> {
    return this.missionDataHelper.getPublishedMissions();
  }

  /**
   * Get upcoming missions (public)
   */
  async getUpcomingMissions(): Promise<Mission[]> {
    return this.missionDataHelper.getUpcomingMissions();
  }

  /**
   * Get mission by ID
   */
  async getMissionById(missionId: string): Promise<Mission> {
    const mission = this.missionDataHelper.getMissionById(missionId);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    return mission;
  }

  /**
   * Get mission by slug (public)
   */
  async getMissionBySlug(slug: string): Promise<Mission> {
    const mission = this.missionDataHelper.getMissionBySlug(slug);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    return mission;
  }

  /**
   * Create mission
   */
  async createMission(data: CreateMissionData, createdBy: string): Promise<Mission> {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      throw createError.badRequest('End date cannot be before start date');
    }

    // Generate slug from title
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    if (this.missionDataHelper.slugExists(slug)) {
      throw createError.conflict('A mission with similar title already exists');
    }

    const missionId = generateId();
    
    const mission: Mission = {
      missionId,
      title: data.title,
      slug,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: data.status || 'draft',
      imageUrl: data.imageUrl,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create mission folders
    this.createMissionFolders(data.title, missionId);

    return this.missionDataHelper.createMission(mission);
  }

  /**
   * Update mission
   */
  async updateMission(
    missionId: string,
    updates: UpdateMissionData
  ): Promise<Mission> {
    const mission = this.missionDataHelper.getMissionById(missionId);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    // Validate dates if provided
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(updates.startDate || mission.startDate);
      const endDate = new Date(updates.endDate || mission.endDate);
      
      if (endDate < startDate) {
        throw createError.badRequest('End date cannot be before start date');
      }
    }

    const updatedMission = this.missionDataHelper.updateMission(missionId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedMission) {
      throw createError.internal('Failed to update mission');
    }

    return updatedMission;
  }

  /**
   * Delete mission (cascades to sub-events, teams, etc.)
   */
  async deleteMission(missionId: string): Promise<void> {
    const mission = this.missionDataHelper.getMissionById(missionId);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    // Delete related sub-events
    this.subEventDataHelper.deleteSubEventsByMission(missionId);

    // Delete mission
    const deleted = this.missionDataHelper.deleteMission(missionId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete mission');
    }
  }

  /**
   * Search missions
   */
  async searchMissions(query: string): Promise<Mission[]> {
    return this.missionDataHelper.searchMissions(query);
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Create mission folders for artifacts, galleries, and scientists
   */
  private createMissionFolders(title: string, missionId: string): void {
    try {
      // Create sanitized folder name: missionTitle-missionId
      const sanitizedTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      const folderName = `${sanitizedTitle}-${missionId}`;

      // Base uploads directory (project root)
      const uploadsBase = path.join(process.cwd(), '..', 'uploads');

      // Define folder paths
      const folders = [
        path.join(uploadsBase, 'mission-artifacts', folderName),
        path.join(uploadsBase, 'mission-galleries', folderName),
        path.join(uploadsBase, 'mission-scientists', folderName)
      ];

      // Create each folder
      folders.forEach(folderPath => {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
          console.log(`✅ Created mission folder: ${folderPath}`);
        }
      });
    } catch (error) {
      console.error('❌ Error creating mission folders:', error);
      // Don't throw error - folder creation failure shouldn't block mission creation
    }
  }

  /**
   * Get mission with sub-events
   */
  async getMissionWithSubEvents(missionId: string): Promise<{
    mission: Mission;
    subEvents: SubEvent[];
  }> {
    const mission = await this.getMissionById(missionId);
    const subEvents = this.subEventDataHelper.getPublishedSubEvents(missionId);

    return {
      mission,
      subEvents
    };
  }
}
