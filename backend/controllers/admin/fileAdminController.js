const fileService = require('../../services/fileService');
const { getRequestInfo } = require('../../middleware/requestLogger');

class FileAdminController {
  // Upload file
  uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { category, missionId, subEventId, description } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const fileData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category,
        missionId,
        subEventId,
        description
      };

      const file = fileService.uploadFile(fileData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: file
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all files
  getAllFiles(req, res, next) {
    try {
      const files = fileService.getAllFiles();

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      next(error);
    }
  }

  // Update file metadata
  updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const file = fileService.updateFile(id, updateData, userId, requestInfo);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        message: 'File updated successfully',
        data: file
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete file
  deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = fileService.deleteFile(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Upload gallery image
  uploadGalleryImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const { title, description, missionId, subEventId } = req.body;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const imageData = {
        imageUrl: req.file.path,
        title,
        description,
        missionId,
        subEventId
      };

      const image = fileService.uploadGalleryImage(imageData, userId, requestInfo);

      res.status(201).json({
        success: true,
        message: 'Gallery image uploaded successfully',
        data: image
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all gallery images
  getAllGalleryImages(req, res, next) {
    try {
      const images = fileService.getAllGalleryImages();

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete gallery image
  deleteGalleryImage(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const requestInfo = getRequestInfo(req);

      const success = fileService.deleteGalleryImage(id, userId, requestInfo);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Gallery image not found'
        });
      }

      res.json({
        success: true,
        message: 'Gallery image deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new FileAdminController();

