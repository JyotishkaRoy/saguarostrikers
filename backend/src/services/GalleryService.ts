import { GalleryDataHelper } from '../data/GalleryDataHelper.js';
import { GalleryImage, CreateGalleryImageData } from '../models/types';
import { unlink } from 'fs/promises';
import { join } from 'path';

export class GalleryService {
  private dataHelper: GalleryDataHelper;

  constructor(dataHelper?: GalleryDataHelper) {
    this.dataHelper = dataHelper || new GalleryDataHelper();
  }

  async getAllImages(): Promise<GalleryImage[]> {
    return await this.dataHelper.getAllImages();
  }

  async getPublicImages(): Promise<GalleryImage[]> {
    return await this.dataHelper.getPublicImages();
  }

  async getImageById(galleryId: string): Promise<GalleryImage | null> {
    return await this.dataHelper.getImageById(galleryId);
  }

  async getImagesByMission(missionId: string): Promise<GalleryImage[]> {
    return await this.dataHelper.getImagesByMission(missionId);
  }

  async getPublishedImagesByMission(missionId: string): Promise<GalleryImage[]> {
    return await this.dataHelper.getPublishedImagesByMission(missionId);
  }

  async getImagesByOutreach(outreachId: string): Promise<GalleryImage[]> {
    return await this.dataHelper.getImagesByOutreach(outreachId);
  }

  async getPublishedImagesByOutreach(outreachId: string): Promise<GalleryImage[]> {
    return await this.dataHelper.getPublishedImagesByOutreach(outreachId);
  }

  async getImagesBySubEvent(subEventId: string): Promise<GalleryImage[]> {
    return await this.dataHelper.getImagesBySubEvent(subEventId);
  }

  async getImagesByTags(tags: string[]): Promise<GalleryImage[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

    return await this.dataHelper.getImagesByTags(tags);
  }

  async createImage(data: CreateGalleryImageData, uploadedBy: string): Promise<GalleryImage> {
    // Validation
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Image title is required');
    }

    if (data.title.length > 200) {
      throw new Error('Image title must be less than 200 characters');
    }

    if (!data.imageUrl || data.imageUrl.trim().length === 0) {
      throw new Error('Image URL is required');
    }

    return await this.dataHelper.createImage(data, uploadedBy);
  }

  async updateImage(galleryId: string, data: Partial<GalleryImage>): Promise<GalleryImage | null> {
    const existingImage = await this.dataHelper.getImageById(galleryId);
    if (!existingImage) {
      throw new Error('Image not found');
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error('Image title cannot be empty');
      }
      if (data.title.length > 200) {
        throw new Error('Image title must be less than 200 characters');
      }
    }

    return await this.dataHelper.updateImage(galleryId, data);
  }

  async toggleImageVisibility(galleryId: string): Promise<GalleryImage | null> {
    const image = await this.dataHelper.getImageById(galleryId);
    if (!image) {
      throw new Error('Image not found');
    }

    return await this.dataHelper.updateImage(galleryId, { isPublic: !image.isPublic });
  }

  async recordView(galleryId: string): Promise<boolean> {
    return await this.dataHelper.incrementViewCount(galleryId);
  }

  async deleteImage(galleryId: string): Promise<boolean> {
    const image = await this.dataHelper.getImageById(galleryId);
    if (!image) {
      throw new Error('Image not found');
    }

    // Delete from database
    const deleted = await this.dataHelper.deleteImage(galleryId);

    // Optionally delete physical image
    if (deleted && image.imageUrl.startsWith('/uploads')) {
      try {
        const fullPath = join(process.cwd(), image.imageUrl);
        await unlink(fullPath);
      } catch (error) {
        console.error('Error deleting physical image:', error);
        // Don't throw error if physical file deletion fails
      }
    }

    return deleted;
  }

  async searchImages(query: string): Promise<GalleryImage[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return await this.dataHelper.searchImages(query);
  }

  async addTags(galleryId: string, tags: string[]): Promise<GalleryImage | null> {
    const image = await this.dataHelper.getImageById(galleryId);
    if (!image) {
      throw new Error('Image not found');
    }

    const currentTags = image.tags || [];
    const newTags = [...new Set([...currentTags, ...tags])]; // Remove duplicates

    return await this.dataHelper.updateImage(galleryId, { tags: newTags });
  }

  async removeTags(galleryId: string, tags: string[]): Promise<GalleryImage | null> {
    const image = await this.dataHelper.getImageById(galleryId);
    if (!image) {
      throw new Error('Image not found');
    }

    const currentTags = image.tags || [];
    const newTags = currentTags.filter(tag => !tags.includes(tag));

    return await this.dataHelper.updateImage(galleryId, { tags: newTags });
  }

  // Get gallery statistics
  async getGalleryStatistics(): Promise<{
    totalImages: number;
    publicImages: number;
    privateImages: number;
    totalViews: number;
    popularTags: Array<{ tag: string; count: number }>;
  }> {
    const images = await this.dataHelper.getAllImages();

    const tagCounts: Record<string, number> = {};
    images.forEach(image => {
      image.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalImages: images.length,
      publicImages: images.filter(i => i.isPublic).length,
      privateImages: images.filter(i => !i.isPublic).length,
      totalViews: images.reduce((sum, i) => sum + i.viewCount, 0),
      popularTags,
    };
  }
}
