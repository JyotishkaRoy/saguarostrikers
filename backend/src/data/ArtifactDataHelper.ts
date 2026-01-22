import { BaseDataHelper } from './BaseDataHelper.js';
import { MissionArtifact } from '../models/types.js';

export class ArtifactDataHelper extends BaseDataHelper<MissionArtifact> {
  constructor() {
    super('artifacts.json');
  }

  /**
   * Get artifact by ID
   */
  public getArtifactById(artifactId: string): MissionArtifact | null {
    return this.getById(artifactId, 'artifactId');
  }

  /**
   * Get all artifacts for a mission
   */
  public getArtifactsByMission(missionId: string): MissionArtifact[] {
    this.loadData();
    return this.data.filter(artifact => artifact.missionId === missionId);
  }

  /**
   * Get published artifacts for a mission
   */
  public getPublishedArtifactsByMission(missionId: string): MissionArtifact[] {
    this.loadData();
    return this.data.filter(
      artifact => artifact.missionId === missionId && artifact.status === 'published'
    );
  }

  /**
   * Create a new artifact
   */
  public createArtifact(artifactData: MissionArtifact): MissionArtifact {
    return this.add(artifactData);
  }

  /**
   * Update an artifact
   */
  public updateArtifact(artifactId: string, updateData: Partial<MissionArtifact>): MissionArtifact | null {
    return this.updateById(artifactId, 'artifactId', updateData);
  }

  /**
   * Delete an artifact
   */
  public deleteArtifact(artifactId: string): boolean {
    return this.deleteById(artifactId, 'artifactId');
  }

  /**
   * Get all artifacts
   */
  public getAllArtifacts(): MissionArtifact[] {
    this.loadData();
    return [...this.data];
  }
}
