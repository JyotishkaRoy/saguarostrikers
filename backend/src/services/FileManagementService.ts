import { FileDataHelper } from '../data/FileDataHelper';
import { FileUpload, CreateFileData } from '../models/types';
import { unlink } from 'fs/promises';
import { join } from 'path';

export class FileManagementService {
  private dataHelper: FileDataHelper;

  constructor(dataHelper?: FileDataHelper) {
    this.dataHelper = dataHelper || new FileDataHelper();
  }

  async getAllFiles(): Promise<FileUpload[]> {
    return await this.dataHelper.getAllFiles();
  }

  async getPublicFiles(): Promise<FileUpload[]> {
    return await this.dataHelper.getPublicFiles();
  }

  async getFileById(fileId: string): Promise<FileUpload | null> {
    return await this.dataHelper.getFileById(fileId);
  }

  async getFilesByCompetition(competitionId: string): Promise<FileUpload[]> {
    return await this.dataHelper.getFilesByCompetition(competitionId);
  }

  async getFilesBySubEvent(subEventId: string): Promise<FileUpload[]> {
    return await this.dataHelper.getFilesBySubEvent(subEventId);
  }

  async getFilesByCategory(category: string): Promise<FileUpload[]> {
    return await this.dataHelper.getFilesByCategory(category);
  }

  async createFile(data: CreateFileData, uploadedBy: string): Promise<FileUpload> {
    // Validation
    if (!data.originalName || data.originalName.trim().length === 0) {
      throw new Error('File name is required');
    }

    if (!data.filePath || data.filePath.trim().length === 0) {
      throw new Error('File path is required');
    }

    if (data.fileSize <= 0) {
      throw new Error('Invalid file size');
    }

    // Check file size limit (e.g., 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (data.fileSize > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    return await this.dataHelper.createFile(data, uploadedBy);
  }

  async updateFile(fileId: string, data: Partial<FileUpload>): Promise<FileUpload | null> {
    const existingFile = await this.dataHelper.getFileById(fileId);
    if (!existingFile) {
      throw new Error('File not found');
    }

    return await this.dataHelper.updateFile(fileId, data);
  }

  async toggleFileVisibility(fileId: string): Promise<FileUpload | null> {
    const file = await this.dataHelper.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    return await this.dataHelper.updateFile(fileId, { isPublic: !file.isPublic });
  }

  async recordDownload(fileId: string): Promise<boolean> {
    return await this.dataHelper.incrementDownloadCount(fileId);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const file = await this.dataHelper.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Delete from database
    const deleted = await this.dataHelper.deleteFile(fileId);

    // Optionally delete physical file
    if (deleted) {
      try {
        const fullPath = join(process.cwd(), file.filePath);
        await unlink(fullPath);
      } catch (error) {
        console.error('Error deleting physical file:', error);
        // Don't throw error if physical file deletion fails
      }
    }

    return deleted;
  }

  async searchFiles(query: string): Promise<FileUpload[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return await this.dataHelper.searchFiles(query);
  }

  // Get file statistics
  async getFileStatistics(): Promise<{
    totalFiles: number;
    publicFiles: number;
    privateFiles: number;
    totalSize: number;
    byCategory: Record<string, number>;
  }> {
    const files = await this.dataHelper.getAllFiles();

    const stats = {
      totalFiles: files.length,
      publicFiles: files.filter(f => f.isPublic).length,
      privateFiles: files.filter(f => !f.isPublic).length,
      totalSize: files.reduce((sum, f) => sum + f.fileSize, 0),
      byCategory: {} as Record<string, number>,
    };

    // Count by category
    files.forEach(file => {
      stats.byCategory[file.category] = (stats.byCategory[file.category] || 0) + 1;
    });

    return stats;
  }
}
