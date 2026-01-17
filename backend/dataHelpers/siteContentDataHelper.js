const { readDB, writeDB, DB_FILES } = require('../config/database');

class SiteContentDataHelper {
  getSiteContent() {
    return readDB(DB_FILES.SITE_CONTENT);
  }

  getHomepageContent() {
    const content = this.getSiteContent();
    return content.homepage || { heroImages: [], aboutUs: '', vision: '', mission: '' };
  }

  updateHomepageContent(updateData) {
    const content = this.getSiteContent();
    content.homepage = {
      ...content.homepage,
      ...updateData
    };
    writeDB(DB_FILES.SITE_CONTENT, content);
    return content.homepage;
  }

  addHeroImage(imageUrl) {
    const content = this.getSiteContent();
    if (!content.homepage.heroImages) {
      content.homepage.heroImages = [];
    }
    content.homepage.heroImages.push(imageUrl);
    writeDB(DB_FILES.SITE_CONTENT, content);
    return content.homepage;
  }

  removeHeroImage(imageUrl) {
    const content = this.getSiteContent();
    if (content.homepage.heroImages) {
      content.homepage.heroImages = content.homepage.heroImages.filter(img => img !== imageUrl);
    }
    writeDB(DB_FILES.SITE_CONTENT, content);
    return content.homepage;
  }
}

module.exports = new SiteContentDataHelper();

