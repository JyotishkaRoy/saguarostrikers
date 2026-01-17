import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GalleryImage, CreateGalleryImageData } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GalleryDataHelper {
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || join(__dirname, '../../../data', 'galleries.json');
  }

  private readData(): GalleryImage[] {
    try {
      const data = readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading gallery data:', error);
      return [];
    }
  }

  private writeData(images: GalleryImage[]): void {
    try {
      writeFileSync(this.dataPath, JSON.stringify(images, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing gallery data:', error);
      throw error;
    }
  }

  async getAllImages(): Promise<GalleryImage[]> {
    return this.readData();
  }

  async getPublicImages(): Promise<GalleryImage[]> {
    const images = this.readData();
    return images.filter(image => image.isPublic);
  }

  async getImageById(galleryId: string): Promise<GalleryImage | null> {
    const images = this.readData();
    return images.find(image => image.galleryId === galleryId) || null;
  }

  async getImagesByCompetition(competitionId: string): Promise<GalleryImage[]> {
    const images = this.readData();
    return images.filter(image => image.competitionId === competitionId);
  }

  async getImagesBySubEvent(subEventId: string): Promise<GalleryImage[]> {
    const images = this.readData();
    return images.filter(image => image.subEventId === subEventId);
  }

  async getImagesByTags(tags: string[]): Promise<GalleryImage[]> {
    const images = this.readData();
    return images.filter(image =>
      image.tags?.some(tag => tags.includes(tag))
    );
  }

  async createImage(data: CreateGalleryImageData, uploadedBy: string): Promise<GalleryImage> {
    const images = this.readData();
    const now = new Date().toISOString();

    const newImage: GalleryImage = {
      galleryId: uuidv4(),
      imageUrl: data.imageUrl,
      title: data.title,
      description: data.description,
      competitionId: data.competitionId,
      subEventId: data.subEventId,
      isPublic: data.isPublic !== undefined ? data.isPublic : false,
      viewCount: 0,
      tags: data.tags || [],
      uploadedBy,
      uploadedAt: now,
    };

    images.push(newImage);
    this.writeData(images);
    return newImage;
  }

  async updateImage(galleryId: string, data: Partial<GalleryImage>): Promise<GalleryImage | null> {
    const images = this.readData();
    const index = images.findIndex(image => image.galleryId === galleryId);

    if (index === -1) {
      return null;
    }

    const updatedImage: GalleryImage = {
      ...images[index],
      ...data,
      galleryId: images[index].galleryId, // Don't allow changing ID
      uploadedBy: images[index].uploadedBy, // Don't allow changing uploader
      uploadedAt: images[index].uploadedAt, // Don't allow changing upload date
    };

    images[index] = updatedImage;
    this.writeData(images);
    return updatedImage;
  }

  async incrementViewCount(galleryId: string): Promise<boolean> {
    const images = this.readData();
    const index = images.findIndex(image => image.galleryId === galleryId);

    if (index === -1) {
      return false;
    }

    images[index].viewCount += 1;
    this.writeData(images);
    return true;
  }

  async deleteImage(galleryId: string): Promise<boolean> {
    const images = this.readData();
    const filteredImages = images.filter(image => image.galleryId !== galleryId);

    if (filteredImages.length === images.length) {
      return false;
    }

    this.writeData(filteredImages);
    return true;
  }

  async searchImages(query: string): Promise<GalleryImage[]> {
    const images = this.readData();
    const lowerQuery = query.toLowerCase();

    return images.filter(image =>
      image.title.toLowerCase().includes(lowerQuery) ||
      image.description?.toLowerCase().includes(lowerQuery) ||
      image.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}
