import { Response } from 'express';
import { ArtifactService } from '../../services/ArtifactService.js';
import { MissionService } from '../../services/MissionService.js';
import { AuthRequest } from '../../models/types.js';
import path from 'path';
import fs from 'fs';

export class ArtifactAdminController {
  private artifactService: ArtifactService;
  private missionService: MissionService;

  constructor() {
    this.artifactService = new ArtifactService();
    this.missionService = new MissionService();
  }

  /**
   * Get all missions with their artifacts
   */
  async getAllMissionsWithArtifacts(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const missions = await this.missionService.getAllMissions();
      const allArtifacts = await this.artifactService.getAllArtifacts();

      // Group artifacts by mission
      const missionsWithArtifacts = missions.map(mission => ({
        ...mission,
        artifacts: allArtifacts.filter(a => a.missionId === mission.missionId),
      }));

      res.status(200).json({
        success: true,
        data: missionsWithArtifacts,
      });
    } catch (error: any) {
      console.error('Error fetching missions with artifacts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch missions with artifacts',
      });
    }
  }

  /**
   * Get artifacts for a specific mission
   */
  async getArtifactsByMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const artifacts = await this.artifactService.getArtifactsByMission(missionId);
      
      res.status(200).json({
        success: true,
        data: artifacts,
      });
    } catch (error: any) {
      console.error('Error fetching artifacts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch artifacts',
      });
    }
  }

  /**
   * Create a new artifact
   */
  async createArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { missionId, description } = req.body;

      if (!missionId) {
        res.status(400).json({
          success: false,
          message: 'Mission ID is required',
        });
        return;
      }

      if (!description) {
        res.status(400).json({
          success: false,
          message: 'Description is required',
        });
        return;
      }

      // Get mission to construct folder path
      const mission = await this.missionService.getMissionById(missionId);
      if (!mission) {
        res.status(404).json({
          success: false,
          message: 'Mission not found',
        });
        return;
      }

      // Move file from temp to mission-specific folder
      const missionFolder = `${mission.title}-${mission.missionId}`;
      const uploadsBase = path.join(process.cwd(), '..', 'uploads');
      const artifactDir = path.join(
        uploadsBase,
        'mission-artifacts',
        missionFolder
      );

      // Create folder if it doesn't exist
      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }

      // Move file from temp to final location
      const tempFilePath = req.file.path;
      const finalFilePath = path.join(artifactDir, req.file.filename);
      fs.renameSync(tempFilePath, finalFilePath);

      // Construct relative file path
      const relativePath = `mission-artifacts/${missionFolder}/${req.file.filename}`;

      const artifactData = {
        missionId,
        description,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: relativePath,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      };

      const artifact = await this.artifactService.createArtifact(
        artifactData,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        message: 'Artifact created successfully',
        data: artifact,
      });
    } catch (error: any) {
      console.error('Error creating artifact:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create artifact',
      });
    }
  }

  /**
   * Update an artifact
   */
  async updateArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { artifactId } = req.params;
      const { description, status } = req.body;

      const updateData: any = {};
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const artifact = await this.artifactService.updateArtifact(
        artifactId,
        updateData,
        req.user!.userId
      );

      if (!artifact) {
        res.status(404).json({
          success: false,
          message: 'Artifact not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Artifact updated successfully',
        data: artifact,
      });
    } catch (error: any) {
      console.error('Error updating artifact:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update artifact',
      });
    }
  }

  /**
   * Delete an artifact
   */
  async deleteArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { artifactId } = req.params;

      const deleted = await this.artifactService.deleteArtifact(artifactId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Artifact not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Artifact deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting artifact:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete artifact',
      });
    }
  }
}
