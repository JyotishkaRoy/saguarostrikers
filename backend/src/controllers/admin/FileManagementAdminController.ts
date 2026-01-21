import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import { FileManagementService } from '../../services/FileManagementService.js';

export class FileManagementAdminController {
  private fileService: FileManagementService;

  constructor() {
    this.fileService = new FileManagementService();
  }

  async getAllFiles(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const files = await this.fileService.getAllFiles();
      res.status(200).json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch files' });
    }
  }

  async getFileById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const file = await this.fileService.getFileById(fileId);

      if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.status(200).json({ success: true, data: file });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch file' });
    }
  }

  async getFilesByMission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const files = await this.fileService.getFilesByMission(missionId);
      res.status(200).json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch files' });
    }
  }

  async getFilesByCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const files = await this.fileService.getFilesByCategory(category);
      res.status(200).json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch files' });
    }
  }

  async updateFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const file = await this.fileService.updateFile(fileId, req.body);

      if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: file
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update file'
      });
    }
  }

  async toggleFileVisibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const file = await this.fileService.toggleFileVisibility(fileId);

      if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'File visibility toggled successfully',
        data: file
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle file visibility'
      });
    }
  }

  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const deleted = await this.fileService.deleteFile(fileId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete file'
      });
    }
  }

  async searchFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const files = await this.fileService.searchFiles(query as string);
      res.status(200).json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to search files' });
    }
  }

  async getFileStatistics(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.fileService.getFileStatistics();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch file statistics' });
    }
  }
}
