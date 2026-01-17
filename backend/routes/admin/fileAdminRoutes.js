const express = require('express');
const router = express.Router();
const fileAdminController = require('../../controllers/admin/fileAdminController');
const { isAdmin } = require('../../middleware/authMiddleware');
const { upload, handleUploadError } = require('../../middleware/uploadMiddleware');

// All routes require admin authentication
router.use(isAdmin);

// Files
router.post('/files', upload.single('file'), handleUploadError, fileAdminController.uploadFile);
router.get('/files', fileAdminController.getAllFiles);
router.put('/files/:id', fileAdminController.updateFile);
router.delete('/files/:id', fileAdminController.deleteFile);

// Gallery
router.post('/gallery', upload.single('image'), handleUploadError, fileAdminController.uploadGalleryImage);
router.get('/gallery', fileAdminController.getAllGalleryImages);
router.delete('/gallery/:id', fileAdminController.deleteGalleryImage);

module.exports = router;

