import { Request, Response } from 'express';
import { SiteContentService } from '../../services/SiteContentService.js';
import { ApiError, createError } from '../../middleware/errorHandler.js';

interface SiteContentSection {
  contentId: string;
  section: string;
  title: string;
  content: string;
  isPublished: boolean;
  lastModified: string;
}

export class SiteContentAdminController {
  private siteContentService: SiteContentService;

  constructor() {
    this.siteContentService = new SiteContentService();
  }

  /**
   * Get all site content sections
   */
  async getAllContent(_req: Request, res: Response): Promise<void> {
    try {
      const homepageContent = await this.siteContentService.getHomepageContent();
      
      // Serialize hero content as JSON string for rich text editor
      const heroContent = {
        headline: homepageContent.heroHeadline || 'Welcome to Saguaro Strikers Rocketry',
        subheadline: homepageContent.heroSubheadline || 'Join us in pushing the boundaries of amateur rocketry',
        images: homepageContent.heroImages || [],
        ctas: homepageContent.heroCTAs || []
      };

      // Serialize mission commander content as JSON
      const missionCommanderContent = {
        message: homepageContent.missionCommanderMessage || '',
        name: homepageContent.missionCommanderName || 'Mission Commander',
        title: homepageContent.missionCommanderTitle || 'Team Leader',
        image: homepageContent.missionCommanderImage || ''
      };

      // Map homepage content to sections format expected by frontend
      const sections: SiteContentSection[] = [
        {
          contentId: 'homepage-hero',
          section: 'homepage-hero',
          title: 'Homepage Hero Section',
          content: JSON.stringify(heroContent, null, 2),
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'mission-commander',
          section: 'mission-commander',
          title: 'Mission Commander Statement',
          content: JSON.stringify(missionCommanderContent, null, 2),
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'homepage-about',
          section: 'homepage-about',
          title: 'About Us',
          content: homepageContent.aboutUs || '<p>About us content...</p>',
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'homepage-mission',
          section: 'homepage-mission',
          title: 'Mission',
          content: homepageContent.mission || '<p>Mission content...</p>',
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'homepage-vision',
          section: 'homepage-vision',
          title: 'Vision',
          content: homepageContent.vision || '<p>Vision content...</p>',
          isPublished: true,
          lastModified: new Date().toISOString()
        }
      ];

      res.status(200).json({ success: true, data: sections });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch site content' });
      }
    }
  }

  /**
   * Update a specific content section
   */
  async updateContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { title, content, isPublished } = req.body;

      // Map section to homepage field
      const updates: any = {};
      
      switch (contentId) {
        case 'homepage-hero':
          try {
            const heroData = JSON.parse(content);
            updates.heroHeadline = heroData.headline;
            updates.heroSubheadline = heroData.subheadline;
            updates.heroImages = heroData.images || [];
            updates.heroCTAs = heroData.ctas || [];
          } catch (parseError) {
            throw createError.badRequest('Invalid hero content format. Expected JSON with headline, subheadline, images, and ctas');
          }
          break;
        case 'mission-commander':
          try {
            const commanderData = JSON.parse(content);
            updates.missionCommanderMessage = commanderData.message;
            updates.missionCommanderName = commanderData.name;
            updates.missionCommanderTitle = commanderData.title;
            updates.missionCommanderImage = commanderData.image;
          } catch (parseError) {
            throw createError.badRequest('Invalid mission commander content format. Expected JSON with message, name, title, and image');
          }
          break;
        case 'homepage-about':
          updates.aboutUs = content;
          break;
        case 'homepage-mission':
          updates.mission = content;
          break;
        case 'homepage-vision':
          updates.vision = content;
          break;
        default:
          throw createError.badRequest('Invalid content section');
      }

      await this.siteContentService.updateHomepageContent(updates);

      const updatedSection: SiteContentSection = {
        contentId,
        section: contentId,
        title: title || contentId.split('-')[1],
        content,
        isPublished: isPublished !== undefined ? isPublished : true,
        lastModified: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        data: updatedSection
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update content' });
      }
    }
  }

  /**
   * Get hero images
   */
  async getHeroImages(_req: Request, res: Response): Promise<void> {
    try {
      const homepageContent = await this.siteContentService.getHomepageContent();
      res.status(200).json({
        success: true,
        data: homepageContent.heroImages || []
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch hero images' });
    }
  }

  /**
   * Update hero images
   */
  async updateHeroImages(req: Request, res: Response): Promise<void> {
    try {
      const { heroImages } = req.body;

      if (!Array.isArray(heroImages)) {
        throw createError.badRequest('heroImages must be an array');
      }

      const updated = await this.siteContentService.setHeroImages(heroImages);

      res.status(200).json({
        success: true,
        message: 'Hero images updated successfully',
        data: updated.heroImages
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update hero images' });
      }
    }
  }

  /**
   * Upload banner image for hero section
   */
  async uploadBannerImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError.badRequest('No image file uploaded');
      }

      // Construct the public URL for the uploaded image
      const imageUrl = `/uploads/banners/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Banner image uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to upload banner image' });
      }
    }
  }

  /**
   * Upload mission director image
   */
  async uploadMissionDirectorImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError.badRequest('No image file uploaded');
      }

      // Construct the public URL for the uploaded image
      const imageUrl = `/uploads/mission-director/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Mission director image uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to upload mission director image' });
      }
    }
  }
}
