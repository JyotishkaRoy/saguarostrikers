const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DB_FILES } = require('../config/database');

class FileDataHelper {
  getAllFiles() {
    return readDB(DB_FILES.FILES);
  }

  getFileById(fileId) {
    const files = this.getAllFiles();
    return files.find(file => file.fileId === fileId);
  }

  getFilesByCompetition(competitionId) {
    const files = this.getAllFiles();
    return files.filter(file => file.competitionId === competitionId);
  }

  getFilesBySubEvent(subEventId) {
    const files = this.getAllFiles();
    return files.filter(file => file.subEventId === subEventId);
  }

  createFile(fileData) {
    const files = this.getAllFiles();
    const newFile = {
      fileId: uuidv4(),
      ...fileData,
      uploadedAt: new Date().toISOString()
    };
    files.push(newFile);
    writeDB(DB_FILES.FILES, files);
    return newFile;
  }

  updateFile(fileId, updateData) {
    const files = this.getAllFiles();
    const index = files.findIndex(file => file.fileId === fileId);
    
    if (index === -1) return null;
    
    files[index] = {
      ...files[index],
      ...updateData
    };
    
    writeDB(DB_FILES.FILES, files);
    return files[index];
  }

  deleteFile(fileId) {
    const files = this.getAllFiles();
    const filteredFiles = files.filter(file => file.fileId !== fileId);
    
    if (files.length === filteredFiles.length) return false;
    
    writeDB(DB_FILES.FILES, filteredFiles);
    return true;
  }

  // Gallery methods
  getAllGalleryImages() {
    return readDB(DB_FILES.GALLERIES);
  }

  getGalleryImageById(galleryId) {
    const images = this.getAllGalleryImages();
    return images.find(img => img.galleryId === galleryId);
  }

  getGalleryByCompetition(competitionId) {
    const images = this.getAllGalleryImages();
    return images.filter(img => img.competitionId === competitionId);
  }

  getGalleryBySubEvent(subEventId) {
    const images = this.getAllGalleryImages();
    return images.filter(img => img.subEventId === subEventId);
  }

  createGalleryImage(imageData) {
    const images = this.getAllGalleryImages();
    const newImage = {
      galleryId: uuidv4(),
      ...imageData,
      uploadedAt: new Date().toISOString()
    };
    images.push(newImage);
    writeDB(DB_FILES.GALLERIES, images);
    return newImage;
  }

  deleteGalleryImage(galleryId) {
    const images = this.getAllGalleryImages();
    const filteredImages = images.filter(img => img.galleryId !== galleryId);
    
    if (images.length === filteredImages.length) return false;
    
    writeDB(DB_FILES.GALLERIES, filteredImages);
    return true;
  }
}

module.exports = new FileDataHelper();

