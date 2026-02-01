import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { SiteContentService } from '../../services/SiteContentService.js';
import { ApiError, createError } from '../../middleware/errorHandler.js';
import { UPLOAD_DIRS } from '../../middleware/upload.js';

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
      const joinMissionAgreements = await this.siteContentService.getJoinMissionAgreements();

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
        },
        {
          contentId: 'featured-videos',
          section: 'featured-videos',
          title: 'Featured Videos',
          content: JSON.stringify({ videos: homepageContent.featuredVideos || [] }, null, 2),
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'join-mission-agreement-financial',
          section: 'join-mission-agreement-financial',
          title: 'Financial Obligations Agreement',
          content: joinMissionAgreements.agreementFinancial,
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'join-mission-agreement-photograph',
          section: 'join-mission-agreement-photograph',
          title: 'Photograph & Video Consent',
          content: joinMissionAgreements.agreementPhotograph,
          isPublished: true,
          lastModified: new Date().toISOString()
        },
        {
          contentId: 'join-mission-agreement-liability',
          section: 'join-mission-agreement-liability',
          title: 'Liability Release',
          content: joinMissionAgreements.agreementLiability,
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
        case 'featured-videos': {
          try {
            const { videos } = JSON.parse(content);
            if (!Array.isArray(videos)) throw new Error('videos must be an array');
            updates.featuredVideos = videos.slice(0, 3).map((v: any) => ({
              id: v.id || undefined,
              title: v.title || '',
              url: v.url || '',
              thumbnail: v.thumbnail || undefined
            }));
          } catch (parseError) {
            throw createError.badRequest('Invalid featured videos format. Expected JSON with videos array (max 3 items, each with title and url)');
          }
          break;
        }
        case 'join-mission-agreement-financial':
          await this.siteContentService.updateJoinMissionAgreements({ agreementFinancial: String(content ?? '') });
          break;
        case 'join-mission-agreement-photograph':
          await this.siteContentService.updateJoinMissionAgreements({ agreementPhotograph: String(content ?? '') });
          break;
        case 'join-mission-agreement-liability':
          await this.siteContentService.updateJoinMissionAgreements({ agreementLiability: String(content ?? '') });
          break;
        default:
          throw createError.badRequest('Invalid content section');
      }

      if (Object.keys(updates).length > 0) {
        await this.siteContentService.updateHomepageContent(updates);
      }

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
   * Upload featured video file (max 3 on homepage)
   */
  async uploadFeaturedVideo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError.badRequest('No video file uploaded');
      }

      const videoUrl = `/uploads/featured-videos/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Featured video uploaded successfully',
        data: {
          url: videoUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to upload featured video' });
      }
    }
  }

  /**
   * Delete a featured video file from uploads/featured-videos (when admin removes a video)
   */
  async deleteFeaturedVideo(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        throw createError.badRequest('Missing or invalid url in request body');
      }
      const trimmed = url.trim();
      if (!trimmed.startsWith('/uploads/featured-videos/')) {
        throw createError.badRequest('URL must be a featured-videos upload path');
      }
      const filename = path.basename(trimmed);
      if (!filename || filename === '.' || filename === '..' || filename.includes('/') || filename.includes('\\')) {
        throw createError.badRequest('Invalid file path');
      }
      const filePath = path.resolve(UPLOAD_DIRS.featuredVideos, filename);
      const dirResolved = path.resolve(UPLOAD_DIRS.featuredVideos);
      if (!filePath.startsWith(dirResolved + path.sep) && filePath !== dirResolved) {
        throw createError.badRequest('Invalid file path');
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(200).json({
        success: true,
        message: 'Featured video file deleted'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete featured video file' });
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

  /**
   * Get Future Explorers page content (admin)
   */
  async getFutureExplorers(_req: Request, res: Response): Promise<void> {
    try {
      const content = await this.siteContentService.getFutureExplorersContent();
      res.status(200).json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch Future Explorers content' });
    }
  }

  /**
   * Update Future Explorers content (row1Col1Html, row2Html) – publishes immediately
   */
  async updateFutureExplorers(req: Request, res: Response): Promise<void> {
    try {
      const { row1Col1Html, row2Html } = req.body;
      const updates: { row1Col1Html?: string; row2Html?: string } = {};
      if (typeof row1Col1Html === 'string') updates.row1Col1Html = row1Col1Html;
      if (typeof row2Html === 'string') updates.row2Html = row2Html;
      const content = await this.siteContentService.updateFutureExplorersContent(updates);
      res.status(200).json({ success: true, message: 'Content updated and published', data: content });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update Future Explorers content' });
      }
    }
  }

  /**
   * Upload carousel image for Future Explorers and add to carousel (admin)
   */
  async uploadFutureExplorersCarouselImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw createError.badRequest('No image file uploaded');
      }
      const imageUrl = `/uploads/future-explorers/${req.file.filename}`;
      const content = await this.siteContentService.addFutureExplorersCarouselImage(imageUrl);
      res.status(200).json({
        success: true,
        message: 'Carousel image uploaded and published',
        data: content,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to upload carousel image' });
      }
    }
  }

  /**
   * Update carousel image (sequence, active) (admin)
   */
  async updateFutureExplorersCarouselImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const { sequence, active } = req.body;
      const updates: { sequence?: number; active?: boolean } = {};
      if (typeof sequence === 'number') updates.sequence = sequence;
      if (typeof active === 'boolean') updates.active = active;
      const content = await this.siteContentService.updateFutureExplorersCarouselImage(imageId, updates);
      if (!content) {
        res.status(404).json({ success: false, message: 'Carousel image not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Carousel image updated', data: content });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update carousel image' });
      }
    }
  }

  /**
   * Delete carousel image (admin)
   */
  async deleteFutureExplorersCarouselImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const content = await this.siteContentService.removeFutureExplorersCarouselImage(imageId);
      res.status(200).json({ success: true, message: 'Carousel image removed', data: content });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete carousel image' });
      }
    }
  }

  /**
   * Reorder carousel images (admin) – body: { orderedImageIds: string[] }
   */
  async setFutureExplorersCarouselOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderedImageIds } = req.body;
      if (!Array.isArray(orderedImageIds)) {
        throw createError.badRequest('orderedImageIds must be an array');
      }
      const content = await this.siteContentService.getFutureExplorersContent();
      const byId = new Map((content.carouselImages ?? []).map((img) => [img.imageId, img]));
      const ordered = orderedImageIds
        .filter((id: string) => byId.has(id))
        .map((id: string, idx: number) => ({ ...byId.get(id)!, sequence: idx }));
      const updated = await this.siteContentService.setFutureExplorersCarouselOrder(ordered);
      res.status(200).json({ success: true, message: 'Carousel order updated', data: updated });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to reorder carousel' });
      }
    }
  }
}
