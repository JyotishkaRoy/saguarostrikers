import { ArtifactDataHelper } from '../data/ArtifactDataHelper.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import {
  MissionArtifact,
  CreateArtifactData,
  UpdateArtifactData,
} from '../models/types.js';
import { generateId } from '../utils/idGenerator.js';
import fs from 'fs';
import path from 'path';

export class ArtifactService {
  private artifactDataHelper: ArtifactDataHelper;
  private missionDataHelper: MissionDataHelper;

  constructor() {
    this.artifactDataHelper = new ArtifactDataHelper();
    this.missionDataHelper = new MissionDataHelper();
  }

  /**
   * Create a new artifact
   */
  async createArtifact(
    data: CreateArtifactData,
    userId: string
  ): Promise<MissionArtifact> {
    // Verify mission exists
    const mission = this.missionDataHelper.getMissionById(data.missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Create artifact folder if it doesn't exist
    const missionFolder = `${mission.title}-${mission.missionId}`;
    const uploadsBase = path.join(process.cwd(), '..', 'uploads');
    const artifactFolder = path.join(
      uploadsBase,
      'mission-artifacts',
      missionFolder
    );
    
    if (!fs.existsSync(artifactFolder)) {
      fs.mkdirSync(artifactFolder, { recursive: true });
    }

    // Create artifact record
    const artifact: MissionArtifact = {
      artifactId: generateId(),
      missionId: data.missionId,
      description: data.description,
      fileName: data.fileName,
      originalFileName: data.originalFileName,
      filePath: data.filePath,
      fileType: data.fileType,
      fileSize: data.fileSize,
      status: 'draft',
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.artifactDataHelper.createArtifact(artifact);
  }

  /**
   * Get artifact by ID
   */
  async getArtifactById(artifactId: string): Promise<MissionArtifact | null> {
    return this.artifactDataHelper.getArtifactById(artifactId);
  }

  /**
   * Get all artifacts for a mission
   */
  async getArtifactsByMission(missionId: string): Promise<MissionArtifact[]> {
    return this.artifactDataHelper.getArtifactsByMission(missionId);
  }

  /**
   * Get published artifacts for a mission
   */
  async getPublishedArtifactsByMission(missionId: string): Promise<MissionArtifact[]> {
    return this.artifactDataHelper.getPublishedArtifactsByMission(missionId);
  }

  /**
   * Update an artifact
   */
  async updateArtifact(
    artifactId: string,
    updateData: UpdateArtifactData,
    _userId: string
  ): Promise<MissionArtifact | null> {
    const artifact = this.artifactDataHelper.getArtifactById(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    const updatePayload: Partial<MissionArtifact> = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // If status is being changed to published, set publishedAt
    if (updateData.status === 'published' && artifact.status !== 'published') {
      updatePayload.publishedAt = new Date().toISOString();
    }

    return this.artifactDataHelper.updateArtifact(artifactId, updatePayload);
  }

  /**
   * Delete an artifact
   */
  async deleteArtifact(artifactId: string): Promise<boolean> {
    const artifact = this.artifactDataHelper.getArtifactById(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    // Delete the physical file
    const uploadsBase = path.join(process.cwd(), '..', 'uploads');
    const filePath = path.join(uploadsBase, artifact.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting artifact file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    return this.artifactDataHelper.deleteArtifact(artifactId);
  }

  /**
   * Get all artifacts (admin only)
   */
  async getAllArtifacts(): Promise<MissionArtifact[]> {
    return this.artifactDataHelper.getAllArtifacts();
  }
}
