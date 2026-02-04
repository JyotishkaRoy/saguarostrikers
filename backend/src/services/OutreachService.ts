import { generateId } from '../utils/idGenerator.js';
import { OutreachDataHelper } from '../data/OutreachDataHelper.js';
import { Outreach, CreateOutreachData, UpdateOutreachData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class OutreachService {
  private outreachDataHelper: OutreachDataHelper;

  constructor() {
    this.outreachDataHelper = new OutreachDataHelper();
  }

  async getAllOutreaches(): Promise<Outreach[]> {
    return this.outreachDataHelper.getAll();
  }

  async getPublishedOutreaches(): Promise<Outreach[]> {
    return this.outreachDataHelper.getPublishedOutreaches();
  }

  async getOutreachById(outreachId: string): Promise<Outreach> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) {
      throw createError.notFound('Outreach not found');
    }
    return outreach;
  }

  async getOutreachBySlug(slug: string): Promise<Outreach> {
    const outreach = this.outreachDataHelper.getOutreachBySlug(slug);
    if (!outreach) {
      throw createError.notFound('Outreach not found');
    }
    return outreach;
  }

  async createOutreach(data: CreateOutreachData, createdBy: string): Promise<Outreach> {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      throw createError.badRequest('End date cannot be before start date');
    }
    const slug = this.generateSlug(data.title);
    if (this.outreachDataHelper.slugExists(slug)) {
      throw createError.conflict('An outreach with similar title already exists');
    }
    const outreachId = generateId();
    const outreach: Outreach = {
      outreachId,
      title: data.title,
      slug,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: data.status || 'draft',
      imageUrl: data.imageUrl,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.outreachDataHelper.createOutreach(outreach);
  }

  async updateOutreach(outreachId: string, updates: UpdateOutreachData): Promise<Outreach> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) {
      throw createError.notFound('Outreach not found');
    }
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(updates.startDate || outreach.startDate);
      const endDate = new Date(updates.endDate || outreach.endDate);
      if (endDate < startDate) {
        throw createError.badRequest('End date cannot be before start date');
      }
    }
    const updated = this.outreachDataHelper.updateOutreach(outreachId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    if (!updated) {
      throw createError.internal('Failed to update outreach');
    }
    return updated;
  }

  async deleteOutreach(outreachId: string): Promise<void> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) {
      throw createError.notFound('Outreach not found');
    }
    const deleted = this.outreachDataHelper.deleteOutreach(outreachId);
    if (!deleted) {
      throw createError.internal('Failed to delete outreach');
    }
  }

  async searchOutreaches(query: string): Promise<Outreach[]> {
    return this.outreachDataHelper.searchOutreaches(query);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
