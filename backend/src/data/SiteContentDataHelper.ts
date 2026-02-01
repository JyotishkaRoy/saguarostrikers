import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SiteContent, HomepageContent, JoinMissionAgreements, FutureExplorersContent, FutureExplorersCarouselImage } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SiteContentDataHelper {
  private dataPath: string;
  private data: SiteContent;

  constructor() {
    // Same as BaseDataHelper: project root data dir (__dirname = backend/src/data)
    this.dataPath = path.join(__dirname, '../../../data', 'siteContent.json');
    this.data = this.loadData();
  }

  private loadData(): SiteContent {
    try {
      if (fs.existsSync(this.dataPath)) {
        const rawData = fs.readFileSync(this.dataPath, 'utf-8');
        return JSON.parse(rawData);
      }
      
      // Default site content
      const defaultContent: SiteContent = {
        homepage: {
          heroImages: [],
          aboutUs: '',
          vision: '',
          mission: '',
          featuredVideos: []
        }
      };
      
      this.saveData(defaultContent);
      return defaultContent;
    } catch (error) {
      console.error('Error loading site content:', error);
      return {
        homepage: {
          heroImages: [],
          aboutUs: '',
          vision: '',
          mission: '',
          featuredVideos: []
        }
      };
    }
  }

  private saveData(data: SiteContent): void {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    } catch (error) {
      console.error('Error saving site content:', error);
      throw error;
    }
  }

  public getHomepageContent(): HomepageContent {
    this.data = this.loadData();
    const homepage = this.data.homepage;
    return { ...homepage, featuredVideos: homepage.featuredVideos ?? [] };
  }

  public updateHomepageContent(updates: Partial<HomepageContent>): HomepageContent {
    this.data = this.loadData();
    this.data.homepage = { ...this.data.homepage, ...updates };
    this.saveData(this.data);
    return this.data.homepage;
  }

  public addHeroImage(imageUrl: string): HomepageContent {
    this.data = this.loadData();
    if (!this.data.homepage.heroImages.includes(imageUrl)) {
      this.data.homepage.heroImages.push(imageUrl);
      this.saveData(this.data);
    }
    return this.data.homepage;
  }

  public removeHeroImage(imageUrl: string): HomepageContent {
    this.data = this.loadData();
    this.data.homepage.heroImages = this.data.homepage.heroImages.filter(
      img => img !== imageUrl
    );
    this.saveData(this.data);
    return this.data.homepage;
  }

  public setHeroImages(imageUrls: string[]): HomepageContent {
    this.data = this.loadData();
    this.data.homepage.heroImages = imageUrls;
    this.saveData(this.data);
    return this.data.homepage;
  }

  public getJoinMissionAgreements(): JoinMissionAgreements {
    this.data = this.loadData();
    const defaults: JoinMissionAgreements = {
      agreementFinancial: 'I understand and agree to the financial obligations associated with participating in this mission.',
      agreementPhotograph: 'I consent to the use of photographs and videos of the student for promotional and educational purposes related to Saguaro Strikers activities.',
      agreementLiability: 'I acknowledge and accept the risks associated with rocketry activities and release Saguaro Strikers from liability for any injuries or damages that may occur during mission activities.'
    };
    const jm = this.data.joinMission;
    return {
      agreementFinancial: jm?.agreementFinancial ?? defaults.agreementFinancial,
      agreementPhotograph: jm?.agreementPhotograph ?? defaults.agreementPhotograph,
      agreementLiability: jm?.agreementLiability ?? defaults.agreementLiability
    };
  }

  public updateJoinMissionAgreements(updates: Partial<JoinMissionAgreements>): JoinMissionAgreements {
    this.data = this.loadData();
    if (!this.data.joinMission) {
      this.data.joinMission = this.getJoinMissionAgreements();
    }
    this.data.joinMission = { ...this.data.joinMission, ...updates };
    this.saveData(this.data);
    return this.data.joinMission;
  }

  private getDefaultFutureExplorers(): FutureExplorersContent {
    return {
      row1Col1Html: '<h2>About the Program</h2><p>Add rich text content here.</p>',
      carouselImages: [],
      row2Html: '<p>Add images, text, or combination here.</p>',
    };
  }

  public getFutureExplorersContent(): FutureExplorersContent {
    this.data = this.loadData();
    const fe = this.data.futureExplorers;
    if (!fe) return this.getDefaultFutureExplorers();
    return {
      row1Col1Html: fe.row1Col1Html ?? this.getDefaultFutureExplorers().row1Col1Html,
      carouselImages: fe.carouselImages ?? [],
      row2Html: fe.row2Html ?? this.getDefaultFutureExplorers().row2Html,
    };
  }

  public updateFutureExplorersContent(updates: Partial<FutureExplorersContent>): FutureExplorersContent {
    this.data = this.loadData();
    const current = this.data.futureExplorers ?? this.getDefaultFutureExplorers();
    this.data.futureExplorers = { ...current, ...updates };
    this.saveData(this.data);
    return this.data.futureExplorers;
  }

  public addFutureExplorersCarouselImage(image: FutureExplorersCarouselImage): FutureExplorersContent {
    this.data = this.loadData();
    const fe = this.data.futureExplorers ?? this.getDefaultFutureExplorers();
    const images = fe.carouselImages ?? [];
    const maxSeq = images.length > 0 ? Math.max(...images.map((i) => i.sequence)) : -1;
    fe.carouselImages = [...images, { ...image, sequence: image.sequence ?? maxSeq + 1 }];
    this.data.futureExplorers = fe;
    this.saveData(this.data);
    return this.data.futureExplorers;
  }

  public updateFutureExplorersCarouselImage(
    imageId: string,
    updates: Partial<FutureExplorersCarouselImage>
  ): FutureExplorersContent | null {
    this.data = this.loadData();
    const fe = this.data.futureExplorers ?? this.getDefaultFutureExplorers();
    const images = fe.carouselImages ?? [];
    const index = images.findIndex((i) => i.imageId === imageId);
    if (index === -1) return null;
    fe.carouselImages = images.map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    this.data.futureExplorers = fe;
    this.saveData(this.data);
    return this.data.futureExplorers;
  }

  public removeFutureExplorersCarouselImage(imageId: string): FutureExplorersContent {
    this.data = this.loadData();
    const fe = this.data.futureExplorers ?? this.getDefaultFutureExplorers();
    fe.carouselImages = (fe.carouselImages ?? []).filter((i) => i.imageId !== imageId);
    this.data.futureExplorers = fe;
    this.saveData(this.data);
    return this.data.futureExplorers;
  }

  public setFutureExplorersCarouselOrder(orderedImages: FutureExplorersCarouselImage[]): FutureExplorersContent {
    this.data = this.loadData();
    const fe = this.data.futureExplorers ?? this.getDefaultFutureExplorers();
    fe.carouselImages = orderedImages.map((img, idx) => ({ ...img, sequence: idx }));
    this.data.futureExplorers = fe;
    this.saveData(this.data);
    return this.data.futureExplorers;
  }
}
