import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import { GalleryService } from '../../services/GalleryService.js';
import { MissionService } from '../../services/MissionService.js';
import path from 'path';
import fs from 'fs';

export class GalleryAdminController {
  private galleryService: GalleryService;
  private missionService: MissionService;

  constructor() {
    this.galleryService = new GalleryService();
    this.missionService = new MissionService();
  }

  async getAllImages(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const images = await this.galleryService.getAllImages();
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch images' });
    }
  }

  async getImageById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const image = await this.galleryService.getImageById(galleryId);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({ success: true, data: image });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch image' });
    }
  }

  async getImagesByMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const images = await this.galleryService.getImagesByMission(missionId);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch images' });
    }
  }

  async getAllMissionsWithGalleries(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const { MissionService } = await import('../../services/MissionService.js');
      const missionService = new MissionService();
      
      const missions = await missionService.getAllMissions();
      const allImages = await this.galleryService.getAllImages();

      // Group images by mission
      const missionsWithGalleries = missions.map(mission => ({
        ...mission,
        galleryImages: allImages.filter(img => img.missionId === mission.missionId),
      }));

      res.status(200).json({
        success: true,
        data: missionsWithGalleries,
      });
    } catch (error: any) {
      console.error('Error fetching missions with galleries:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch missions with galleries',
      });
    }
  }

  async getImagesByTags(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tags } = req.query;
      if (!tags) {
        res.status(400).json({ success: false, message: 'Tags parameter is required' });
        return;
      }

      const tagArray = (tags as string).split(',').map(t => t.trim());
      const images = await this.galleryService.getImagesByTags(tagArray);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch images' });
    }
  }

  async updateImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const image = await this.galleryService.updateImage(galleryId, req.body);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: image
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update image'
      });
    }
  }

  async toggleImageVisibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const image = await this.galleryService.toggleImageVisibility(galleryId);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Image visibility toggled successfully',
        data: image
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle image visibility'
      });
    }
  }

  async addTags(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        res.status(400).json({ success: false, message: 'Tags array is required' });
        return;
      }

      const image = await this.galleryService.addTags(galleryId, tags);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tags added successfully',
        data: image
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add tags'
      });
    }
  }

  async removeTags(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        res.status(400).json({ success: false, message: 'Tags array is required' });
        return;
      }

      const image = await this.galleryService.removeTags(galleryId, tags);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tags removed successfully',
        data: image
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove tags'
      });
    }
  }

  async deleteImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const deleted = await this.galleryService.deleteImage(galleryId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete image'
      });
    }
  }

  async searchImages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const images = await this.galleryService.searchImages(query as string);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to search images' });
    }
  }

  async getGalleryStatistics(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.galleryService.getGalleryStatistics();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch gallery statistics' });
    }
  }

  async createGalleryImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { missionId, title, description, status } = req.body;

      if (!missionId) {
        res.status(400).json({
          success: false,
          message: 'Mission ID is required',
        });
        return;
      }

      if (!title || !title.trim()) {
        res.status(400).json({
          success: false,
          message: 'Title is required',
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
      const galleryDir = path.join(
        uploadsBase,
        'mission-galleries',
        missionFolder
      );

      // Create folder if it doesn't exist
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }

      // Move file from temp to final location
      const tempFilePath = req.file.path;
      const finalFilePath = path.join(galleryDir, req.file.filename);
      fs.renameSync(tempFilePath, finalFilePath);

      // Construct relative file path
      const relativePath = `mission-galleries/${missionFolder}/${req.file.filename}`;

      const imageData = {
        imageUrl: relativePath,
        title: title.trim(),
        description: description || '',
        missionId,
        isPublic: status === 'published',
        status: status || 'draft',
      };

      const image = await this.galleryService.createImage(
        imageData,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        message: 'Gallery image created successfully',
        data: image,
      });
    } catch (error: any) {
      console.error('Error creating gallery image:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create gallery image',
      });
    }
  }
}
