const fileDataHelper = require('../dataHelpers/fileDataHelper');
const missionDataHelper = require('../dataHelpers/missionDataHelper');
const subEventDataHelper = require('../dataHelpers/subEventDataHelper');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');
const fs = require('fs');
const path = require('path');

class FileService {
  uploadFile(fileData, userId, requestInfo = {}) {
    const { fileName, originalName, filePath, fileType, fileSize, category, missionId, subEventId, description } = fileData;

    // Verify mission if provided
    if (missionId) {
      const mission = missionDataHelper.getMissionById(missionId);
      if (!mission) {
        throw new Error('Mission not found');
      }
    }

    // Verify sub-event if provided
    if (subEventId) {
      const subEvent = subEventDataHelper.getSubEventById(subEventId);
      if (!subEvent) {
        throw new Error('Sub-event not found');
      }
    }

    const newFile = fileDataHelper.createFile({
      fileName,
      originalName,
      filePath,
      fileType,
      fileSize,
      category: category || 'other',
      missionId: missionId || null,
      subEventId: subEventId || null,
      uploadedBy: userId,
      description: description || ''
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'FILE_UPLOADED',
      entity: 'file',
      entityId: newFile.fileId,
      changes: { fileName: originalName, category, missionId, subEventId },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newFile;
  }

  getFileById(fileId) {
    return fileDataHelper.getFileById(fileId);
  }

  getFilesByMission(missionId) {
    return fileDataHelper.getFilesByMission(missionId);
  }

  getFilesBySubEvent(subEventId) {
    return fileDataHelper.getFilesBySubEvent(subEventId);
  }

  getAllFiles() {
    return fileDataHelper.getAllFiles();
  }

  updateFile(fileId, updateData, userId, requestInfo = {}) {
    const file = fileDataHelper.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const updatedFile = fileDataHelper.updateFile(fileId, updateData);

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'FILE_UPDATED',
      entity: 'file',
      entityId: fileId,
      changes: updateData,
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return updatedFile;
  }

  deleteFile(fileId, userId, requestInfo = {}) {
    const file = fileDataHelper.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Delete physical file
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    const success = fileDataHelper.deleteFile(fileId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'FILE_DELETED',
        entity: 'file',
        entityId: fileId,
        changes: { fileName: file.originalName },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }

  // Gallery methods
  uploadGalleryImage(imageData, userId, requestInfo = {}) {
    const { imageUrl, title, description, missionId, subEventId } = imageData;

    const newImage = fileDataHelper.createGalleryImage({
      imageUrl,
      title,
      description: description || '',
      missionId: missionId || null,
      subEventId: subEventId || null,
      uploadedBy: userId
    });

    // Log audit
    auditLogDataHelper.createLog({
      userId,
      action: 'GALLERY_IMAGE_UPLOADED',
      entity: 'gallery',
      entityId: newImage.galleryId,
      changes: { title, missionId, subEventId },
      ipAddress: requestInfo.ipAddress || '',
      userAgent: requestInfo.userAgent || ''
    });

    return newImage;
  }

  getGalleryByMission(missionId) {
    return fileDataHelper.getGalleryByMission(missionId);
  }

  getGalleryBySubEvent(subEventId) {
    return fileDataHelper.getGalleryBySubEvent(subEventId);
  }

  getAllGalleryImages() {
    return fileDataHelper.getAllGalleryImages();
  }

  deleteGalleryImage(galleryId, userId, requestInfo = {}) {
    const image = fileDataHelper.getGalleryImageById(galleryId);
    if (!image) {
      throw new Error('Gallery image not found');
    }

    // Delete physical file
    try {
      if (fs.existsSync(image.imageUrl)) {
        fs.unlinkSync(image.imageUrl);
      }
    } catch (error) {
      console.error('Error deleting physical image:', error);
    }

    const success = fileDataHelper.deleteGalleryImage(galleryId);

    if (success) {
      // Log audit
      auditLogDataHelper.createLog({
        userId,
        action: 'GALLERY_IMAGE_DELETED',
        entity: 'gallery',
        entityId: galleryId,
        changes: { title: image.title },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });
    }

    return success;
  }
}

module.exports = new FileService();

