import { BaseDataHelper } from './BaseDataHelper.js';
import { Outreach, OutreachStatus } from '../models/types.js';

export class OutreachDataHelper extends BaseDataHelper<Outreach> {
  constructor() {
    super('outreaches.json');
  }

  public getOutreachById(outreachId: string): Outreach | null {
    return this.getById(outreachId, 'outreachId');
  }

  public getOutreachBySlug(slug: string): Outreach | null {
    this.loadData();
    return this.data.find(item => item.slug === slug) || null;
  }

  public createOutreach(data: Outreach): Outreach {
    return this.add(data);
  }

  public updateOutreach(outreachId: string, updates: Partial<Outreach>): Outreach | null {
    return this.updateById(outreachId, 'outreachId', updates);
  }

  public deleteOutreach(outreachId: string): boolean {
    return this.deleteById(outreachId, 'outreachId');
  }

  public getOutreachesByStatus(status: OutreachStatus): Outreach[] {
    return this.findWhere(item => item.status === status);
  }

  public getPublishedOutreaches(): Outreach[] {
    return this.findWhere(item => item.status !== 'draft' && item.status !== 'cancelled');
  }

  public slugExists(slug: string): boolean {
    this.loadData();
    return this.data.some(item => item.slug === slug);
  }

  public searchOutreaches(query: string): Outreach[] {
    const lowerQuery = query.toLowerCase();
    return this.findWhere(
      item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
  }
}
