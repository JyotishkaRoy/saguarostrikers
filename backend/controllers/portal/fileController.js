const fileService = require('../../services/fileService');

class FileController {
  // Get files by competition
  getFilesByCompetition(req, res, next) {
    try {
      const { competitionId } = req.params;
      const files = fileService.getFilesByCompetition(competitionId);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      next(error);
    }
  }

  // Get files by sub-event
  getFilesBySubEvent(req, res, next) {
    try {
      const { subEventId } = req.params;
      const files = fileService.getFilesBySubEvent(subEventId);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      next(error);
    }
  }

  // Get gallery by competition
  getGalleryByCompetition(req, res, next) {
    try {
      const { competitionId } = req.params;
      const gallery = fileService.getGalleryByCompetition(competitionId);

      res.json({
        success: true,
        data: gallery
      });
    } catch (error) {
      next(error);
    }
  }

  // Get gallery by sub-event
  getGalleryBySubEvent(req, res, next) {
    try {
      const { subEventId } = req.params;
      const gallery = fileService.getGalleryBySubEvent(subEventId);

      res.json({
        success: true,
        data: gallery
      });
    } catch (error) {
      next(error);
    }
  }

  // Download file
  downloadFile(req, res, next) {
    try {
      const { fileId } = req.params;
      const file = fileService.getFileById(fileId);

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.download(file.filePath, file.originalName);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();

