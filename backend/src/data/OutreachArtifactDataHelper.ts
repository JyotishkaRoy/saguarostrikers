import { BaseDataHelper } from './BaseDataHelper.js';
import { OutreachArtifact } from '../models/types.js';

export class OutreachArtifactDataHelper extends BaseDataHelper<OutreachArtifact> {
  constructor() {
    super('outreach-artifacts.json');
  }

  getArtifactById(artifactId: string): OutreachArtifact | null {
    return this.getById(artifactId, 'artifactId');
  }

  getByOutreachId(outreachId: string): OutreachArtifact[] {
    return this.findWhere(a => a.outreachId === outreachId);
  }

  getPublishedByOutreachId(outreachId: string): OutreachArtifact[] {
    return this.findWhere(a => a.outreachId === outreachId && a.status === 'published');
  }

  createArtifact(artifact: OutreachArtifact): OutreachArtifact {
    return this.add(artifact);
  }

  updateArtifact(artifactId: string, updates: Partial<OutreachArtifact>): OutreachArtifact | null {
    return this.updateById(artifactId, 'artifactId', updates);
  }

  deleteArtifact(artifactId: string): boolean {
    return this.deleteById(artifactId, 'artifactId');
  }
}
