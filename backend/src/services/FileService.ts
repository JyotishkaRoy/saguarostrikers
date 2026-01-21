import { FileDataHelper } from '../data/FileDataHelper.js';
import { GalleryDataHelper } from '../data/GalleryDataHelper.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { FileUpload, GalleryImage, FileCategory } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';
import { deleteFile as deleteFileFromDisk } from '../middleware/upload.js';

export class FileService {
  private fileDataHelper: FileDataHelper;
  private galleryDataHelper: GalleryDataHelper;
  private missionDataHelper: MissionDataHelper;
  private subEventDataHelper: SubEventDataHelper;

  constructor() {
    this.fileDataHelper = new FileDataHelper();
    this.galleryDataHelper = new GalleryDataHelper();
    this.missionDataHelper = new MissionDataHelper();
    this.subEventDataHelper = new SubEventDataHelper();
  }

  /**
   * Upload file
   */
  async uploadFile(
    file: Express.Multer.File,
    data: {
      category: FileCategory;
      missionId?: string;
      subEventId?: string;
      description?: string;
    },
    uploadedBy: string
  ): Promise<FileUpload> {
    // Verify mission exists if provided
    if (data.missionId) {
      const mission = this.missionDataHelper.getMissionById(data.missionId);
      if (!mission) {
        throw createError.notFound('Mission not found');
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
      missionId: data.missionId,
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
   * Get files by mission
   */
  async getFilesByMission(missionId: string): Promise<FileUpload[]> {
    return this.fileDataHelper.getFilesByMission(missionId);
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
      missionId?: string;
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
      missionId: data.missionId,
      subEventId: data.subEventId,
      isPublic: false,
      tags: []
    };

    return await this.galleryDataHelper.createImage(imageData, uploadedBy);
  }

  /**
   * Get gallery images by mission
   */
  async getGalleryImagesByMission(missionId: string): Promise<GalleryImage[]> {
    return await this.galleryDataHelper.getImagesByMission(missionId);
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
