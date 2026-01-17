import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SiteContent, HomepageContent } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SiteContentDataHelper {
  private dataPath: string;
  private data: SiteContent;

  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/siteContent.json');
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
          mission: ''
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
          mission: ''
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
    return this.data.homepage;
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
}
