import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../../models/types.js';
import { OutreachArtifactService } from '../../services/OutreachArtifactService.js';
import { OutreachDataHelper } from '../../data/OutreachDataHelper.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { getOutreachFolderName } from '../../utils/outreachUploadPaths.js';

export class OutreachArtifactAdminController {
  private artifactService: OutreachArtifactService;
  private outreachDataHelper: OutreachDataHelper;

  constructor() {
    this.artifactService = new OutreachArtifactService();
    this.outreachDataHelper = new OutreachDataHelper();
  }

  async getByOutreach(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { outreachId } = req.params;
      const artifacts = await this.artifactService.getByOutreachId(outreachId);
      res.status(200).json({ success: true, data: artifacts });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch artifacts' });
      }
    }
  }

  async createArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }
      const { outreachId, description } = req.body;
      if (!outreachId) {
        res.status(400).json({ success: false, message: 'outreachId is required' });
        return;
      }
      if (!description || !description.trim()) {
        res.status(400).json({ success: false, message: 'description is required' });
        return;
      }

      const outreach = this.outreachDataHelper.getOutreachById(outreachId);
      if (!outreach) {
        res.status(404).json({ success: false, message: 'Outreach not found' });
        return;
      }

      // Files under uploads/outreach-artifacts/outreachname-outreachId/
      const outreachFolder = getOutreachFolderName(outreach.title, outreach.outreachId);
      const uploadsBase = path.join(process.cwd(), '..', 'uploads');
      const artifactDir = path.join(uploadsBase, 'outreach-artifacts', outreachFolder);
      if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
      }

      const tempFilePath = req.file.path;
      const finalFilePath = path.join(artifactDir, req.file.filename);
      fs.renameSync(tempFilePath, finalFilePath);

      const relativePath = `outreach-artifacts/${outreachFolder}/${req.file.filename}`;
      const artifact = await this.artifactService.createArtifact(
        {
          outreachId,
          description: description.trim(),
          fileName: req.file.filename,
          originalFileName: req.file.originalname,
          filePath: relativePath,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
        req.user!.userId
      );

      res.status(201).json({ success: true, message: 'Artifact created successfully', data: artifact });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: (error as Error).message || 'Failed to create artifact' });
      }
    }
  }

  async updateArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { artifactId } = req.params;
      const { description, status } = req.body;
      const updates: { description?: string; status?: 'draft' | 'published' | 'unpublished' } = {};
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      const artifact = await this.artifactService.updateArtifact(artifactId, updates, req.user!.userId);
      res.status(200).json({ success: true, message: 'Artifact updated', data: artifact });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update artifact' });
      }
    }
  }

  async deleteArtifact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { artifactId } = req.params;
      await this.artifactService.deleteArtifact(artifactId);
      res.status(200).json({ success: true, message: 'Artifact deleted' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete artifact' });
      }
    }
  }
}
