import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import path from 'path';
import fs from 'fs';

export class UploadController {
  /**
   * Generic file upload handler
   * Multer saves to temp, we move to target folder
   * For mission hero images: creates mission-specific folder and replaces old files
   */
  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('📥 Upload request received');
      console.log('Body:', req.body);
      console.log('File:', req.file);
      
      if (!req.file) {
        console.error('❌ No file in request');
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Get folder and mission details from request body
      const folder = (req.body.folder || 'files') as string;
      const missionTitle = req.body.missionTitle;
      const missionId = req.body.missionId;

      // Base upload directory (project root)
      const uploadsBase = path.join(process.cwd(), '..', 'uploads');
      
      let targetDir: string;
      let fileUrl: string;
      
      // For mission hero images, create mission-specific folder
      if (folder === 'missions' && missionTitle && missionId) {
        // Create slug from title (remove special chars, replace spaces with hyphens)
        const titleSlug = missionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const missionFolderName = `${titleSlug}-${missionId}`;
        targetDir = path.join(uploadsBase, 'missions', missionFolderName);
        
        // Ensure mission folder exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(`📁 Created mission folder: ${missionFolderName}`);
        }
        
        // Delete any existing files in the mission folder (only keep one hero image/video)
        const existingFiles = fs.readdirSync(targetDir);
        existingFiles.forEach(file => {
          const filePath = path.join(targetDir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted old file: ${file}`);
        });
        
        // Get filename with extension
        const fileExt = path.extname(req.file.originalname);
        const fileName = `hero${fileExt}`;
        const targetPath = path.join(targetDir, fileName);
        
        // Move file from temp to mission folder
        fs.renameSync(req.file.path, targetPath);
        
        // Generate URL for frontend
        fileUrl = `/uploads/missions/${missionFolderName}/${fileName}`;
      } else {
        // Standard upload for other types
        targetDir = path.join(uploadsBase, folder);
        
        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Get filename from temp file
        const fileName = path.basename(req.file.path);
        const targetPath = path.join(targetDir, fileName);
        
        // Move file from temp to target directory
        fs.renameSync(req.file.path, targetPath);
        
        // Generate URL for frontend
        fileUrl = `/uploads/${folder}/${fileName}`;
      }

      console.log(`✅ File uploaded: ${fileUrl}`);

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: path.basename(fileUrl),
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl) {
        res.status(400).json({
          success: false,
          message: 'File URL is required'
        });
        return;
      }

      // Extract path from URL
      const uploadsBase = path.join(process.cwd(), '..', 'uploads');
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(uploadsBase, relativePath);

      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.status(200).json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }
}
