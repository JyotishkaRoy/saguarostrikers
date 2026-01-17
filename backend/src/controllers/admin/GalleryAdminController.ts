import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import { GalleryService } from '../../services/GalleryService';

export class GalleryAdminController {
  private galleryService: GalleryService;

  constructor() {
    this.galleryService = new GalleryService();
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

  async getImagesByCompetition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { competitionId } = req.params;
      const images = await this.galleryService.getImagesByCompetition(competitionId);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch images' });
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
}
