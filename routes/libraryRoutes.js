const express = require("express");
const multer = require('multer');
const libraryController = require("../controllers/libraryController");
const authMiddleware = require("../middlewares/authMiddleware"); // Your auth middleware

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({
    dest: 'temp-uploads/',
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit per file
    },
});

// Routes
router.get("/get-library", authMiddleware,libraryController.getLibrary);
router.get("/get-library/:id",authMiddleware, libraryController.getLibraryFiles);
router.post("/upload-library", /* authMiddleware, */ upload.array('files'), libraryController.uploadLibrary);
router.delete("/delete-library/:id", authMiddleware, libraryController.deleteLibrary);
router.get("/download/:fileId", libraryController.downloadFile);
router.get("/download-library/:id", libraryController.downloadLibrary);
router.post("/add-files/:id", authMiddleware, upload.array('files'), libraryController.addFilesToLibrary);
router.put("/update-library/:id", authMiddleware, libraryController.updateLibrary);
router.delete("/remove-file/:fileId", authMiddleware, libraryController.removeFileFromLibrary);
module.exports = router;