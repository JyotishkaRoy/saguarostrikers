import { FileDataHelper } from '../data/FileDataHelper.js';
import { GalleryDataHelper } from '../data/GalleryDataHelper.js';
import { CompetitionDataHelper } from '../data/CompetitionDataHelper.js';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { FileUpload, GalleryImage, FileCategory } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';
import { deleteFile as deleteFileFromDisk } from '../middleware/upload.js';

export class FileService {
  private fileDataHelper: FileDataHelper;
  private galleryDataHelper: GalleryDataHelper;
  private competitionDataHelper: CompetitionDataHelper;
  private subEventDataHelper: SubEventDataHelper;

  constructor() {
    this.fileDataHelper = new FileDataHelper();
    this.galleryDataHelper = new GalleryDataHelper();
    this.competitionDataHelper = new CompetitionDataHelper();
    this.subEventDataHelper = new SubEventDataHelper();
  }

  /**
   * Upload file
   */
  async uploadFile(
    file: Express.Multer.File,
    data: {
      category: FileCategory;
      competitionId?: string;
      subEventId?: string;
      description?: string;
    },
    uploadedBy: string
  ): Promise<FileUpload> {
    // Verify competition exists if provided
    if (data.competitionId) {
      const competition = this.competitionDataHelper.getCompetitionById(data.competitionId);
      if (!competition) {
        throw createError.notFound('Competition not found');
      }
    }

    // Verify sub-event exists if provided
    if (data.subEventId) {
      const subEvent = this.subEventDataHelper.getSubEventById(data.subEventId);
      if (!subEvent) {
        throw createError.notFound('Sub-event not found');
      }
    }

    const fileData = {
      originalName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      category: data.category,
      competitionId: data.competitionId,
      subEventId: data.subEventId,
      description: data.description,
      isPublic: false
    };

    return await this.fileDataHelper.createFile(fileData, uploadedBy);
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string): Promise<FileUpload> {
    const file = await this.fileDataHelper.getFileById(fileId);
    
    if (!file) {
      throw createError.notFound('File not found');
    }

    return file;
  }

  /**
   * Get files by competition
   */
  async getFilesByCompetition(competitionId: string): Promise<FileUpload[]> {
    return this.fileDataHelper.getFilesByCompetition(competitionId);
  }

  /**
   * Get files by sub-event
   */
  async getFilesBySubEvent(subEventId: string): Promise<FileUpload[]> {
    return this.fileDataHelper.getFilesBySubEvent(subEventId);
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileDataHelper.getFileById(fileId);
    
    if (!file) {
      throw createError.notFound('File not found');
    }

    // Delete from database
    const deleted = await this.fileDataHelper.deleteFile(fileId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete file');
    }

    // Delete from disk
    deleteFileFromDisk(file.filePath);
  }

  /**
   * Upload gallery image
   */
  async uploadGalleryImage(
    file: Express.Multer.File,
    data: {
      title: string;
      description?: string;
      competitionId?: string;
      subEventId?: string;
    },
    uploadedBy: string
  ): Promise<GalleryImage> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
    const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
    const imageUrl = `${baseUrl}/uploads/${relativePath}`;

    const imageData = {
      imageUrl,
      title: data.title,
      description: data.description,
      competitionId: data.competitionId,
      subEventId: data.subEventId,
      isPublic: false,
      tags: []
    };

    return await this.galleryDataHelper.createImage(imageData, uploadedBy);
  }

  /**
   * Get gallery images by competition
   */
  async getGalleryImagesByCompetition(competitionId: string): Promise<GalleryImage[]> {
    return await this.galleryDataHelper.getImagesByCompetition(competitionId);
  }

  /**
   * Delete gallery image
   */
  async deleteGalleryImage(galleryId: string): Promise<void> {
    const image = await this.galleryDataHelper.getImageById(galleryId);
    
    if (!image) {
      throw createError.notFound('Gallery image not found');
    }

    const deleted = await this.galleryDataHelper.deleteImage(galleryId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete gallery image');
    }

    // Extract file path from URL and delete from disk
    const urlParts = image.imageUrl.split('/uploads/');
    if (urlParts.length > 1) {
      const filePath = `./uploads/${urlParts[1]}`;
      deleteFileFromDisk(filePath);
    }
  }
}
