import path from 'path';
import fs from 'fs';
import { generateId } from '../utils/idGenerator.js';
import { OutreachArtifactDataHelper } from '../data/OutreachArtifactDataHelper.js';
import { OutreachDataHelper } from '../data/OutreachDataHelper.js';
import {
  OutreachArtifact,
  CreateOutreachArtifactData,
  UpdateOutreachArtifactData,
} from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class OutreachArtifactService {
  private artifactDataHelper: OutreachArtifactDataHelper;
  private outreachDataHelper: OutreachDataHelper;

  constructor() {
    this.artifactDataHelper = new OutreachArtifactDataHelper();
    this.outreachDataHelper = new OutreachDataHelper();
  }

  async getByOutreachId(outreachId: string): Promise<OutreachArtifact[]> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    return this.artifactDataHelper.getByOutreachId(outreachId);
  }

  async getPublishedByOutreachId(outreachId: string): Promise<OutreachArtifact[]> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    return this.artifactDataHelper.getPublishedByOutreachId(outreachId);
  }

  async getById(artifactId: string): Promise<OutreachArtifact> {
    const a = this.artifactDataHelper.getArtifactById(artifactId);
    if (!a) throw createError.notFound('Artifact not found');
    return a;
  }

  async createArtifact(data: CreateOutreachArtifactData, userId: string): Promise<OutreachArtifact> {
    const outreach = this.outreachDataHelper.getOutreachById(data.outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');

    const artifact: OutreachArtifact = {
      artifactId: generateId(),
      outreachId: data.outreachId,
      description: data.description,
      fileName: data.fileName,
      originalFileName: data.originalFileName,
      filePath: data.filePath,
      fileType: data.fileType,
      fileSize: data.fileSize,
      status: 'draft',
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.artifactDataHelper.createArtifact(artifact);
  }

  async updateArtifact(
    artifactId: string,
    updates: UpdateOutreachArtifactData,
    _userId: string
  ): Promise<OutreachArtifact> {
    const artifact = this.artifactDataHelper.getArtifactById(artifactId);
    if (!artifact) throw createError.notFound('Artifact not found');
    const updated = this.artifactDataHelper.updateArtifact(artifactId, updates);
    if (!updated) throw createError.internal('Failed to update artifact');
    return updated;
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    const artifact = this.artifactDataHelper.getArtifactById(artifactId);
    if (!artifact) throw createError.notFound('Artifact not found');
    const uploadsBase = path.join(process.cwd(), '..', 'uploads');
    const filePath = path.join(uploadsBase, artifact.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Error deleting artifact file:', e);
      }
    }
    const deleted = this.artifactDataHelper.deleteArtifact(artifactId);
    if (!deleted) throw createError.internal('Failed to delete artifact');
  }
}
