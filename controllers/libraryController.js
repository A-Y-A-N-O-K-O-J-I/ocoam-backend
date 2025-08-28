const db = require("../config/db");
const Library = require("../models/libraryModel");
const { Telegraf } = require('telegraf');
const multer = require('multer');
const fs = require('fs');
const axios = require("axios");
const archiver = require('archiver');
// Initialize Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const STORAGE_CHAT_ID = process.env.TELEGRAM_STORAGE_CHAT_ID;

const libraryController = {
    async getLibrary(req, res) {
        try {
            const libraries = await Library.getAll();
            res.status(200).json({
                status: 200,
                libraries: libraries
            });
        } catch (error) {
            console.error("Error fetching library:", error);
            res.status(500).json({
                status: 500,
                message: "An error occurred"
            });
        }
    },

    async getLibraryFiles(req, res) {
        try {
            const { id } = req.params;
            const library = await Library.getById(id);
            
            if (!library) {
                return res.status(404).json({
                    status: 404,
                    message: "Library not found"
                });
            }

            const files = await Library.getFiles(id);
            
            res.status(200).json({
                status: 200,
                library: library,
                files: files
            });
        } catch (error) {
            console.error("Error fetching library files:", error);
            res.status(500).json({
                status: 500,
                message: "An error occurred"
            });
        }
    },

    async uploadLibrary(req, res) {
        try {
            const { name, description } = req.body;
            const files = req.files;
            const uploadedBy = req.user?.id; // From your auth middleware
            
            if (!files || files.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'No files uploaded'
                });
            }

            if (!name) {
                return res.status(400).json({
                    status: 400,
                    message: 'Name is required'
                });
            }

            const uploadedFiles = [];

            // Upload each file to Telegram
            for (const file of files) {
                try {
                    const message = await bot.telegram.sendDocument(STORAGE_CHAT_ID, {
                        source: file.path,
                        filename: file.originalname
                    }, {
                        caption: `📚 ${name}\n${description ? `📝 ${description}` : ''}\n📄 ${file.originalname}`
                    });

                    uploadedFiles.push({
                        telegram_file_id: message.document.file_id,
                        telegram_message_id: message.message_id,
                        original_name: file.originalname,
                        file_size: file.size,
                        mime_type: file.mimetype
                    });

                    // Clean up temp file
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.error('Error uploading to Telegram:', error);
                    // Clean up temp file on error
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }

            if (uploadedFiles.length === 0) {
                return res.status(500).json({
                    status: 500,
                    message: 'Failed to upload files to Telegram'
                });
            }

            // Save to database
            const library = await Library.create(name, description, uploadedBy, uploadedFiles.length);
            await Library.addFiles(library.id, uploadedFiles);

            res.status(200).json({
                status: 200,
                message: `${uploadedFiles.length} files uploaded successfully`,
                library: library
            });

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                status: 500,
                message: 'Upload failed'
            });
        }
    },

    async deleteLibrary(req, res) {
        try {
            const { id } = req.params;
            
            // Get library files to delete from Telegram
            const files = await Library.getFiles(id);
            
            // Delete messages from Telegram
            for (const file of files) {
                try {
                    await bot.telegram.deleteMessage(STORAGE_CHAT_ID, file.telegram_message_id);
                } catch (error) {
                    console.error('Error deleting from Telegram:', error);
                    // Continue even if Telegram deletion fails
                }
            }

            // Delete from database
            await db.query("DELETE FROM library WHERE id = $1", [id]);

            res.status(200).json({
                status: 200,
                message: "Library deleted successfully"
            });

        } catch (error) {
            console.error("Error deleting library:", error);
            res.status(500).json({
                status: 500,
                message: "An error occurred"
            });
        }
    },

    async downloadFile(req, res) {
    try {
        const { fileId } = req.params;

        // 1. Get file info from DB
        const result = await db.query(
            "SELECT * FROM library_files WHERE id = $1", 
            [fileId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 404, message: "File not found" });
        }

        const file = result.rows[0];

        // 2. Get Telegram file path (not link yet)
        const tgFile = await bot.telegram.getFile(file.telegram_file_id);
        const tgFilePath = tgFile.file_path;
        const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${tgFilePath}`;

        // 3. Set headers so browser knows the filename and type
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Type', file.mime_type);

        // 4. Stream file from Telegram to client
         const response = await axios({
            url: telegramFileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(res);

    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ status: 500, message: "Download failed" });
    }
},

// Add files to existing library
async addFilesToLibrary(req, res) {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'No files uploaded'
            });
        }

        // Check if library exists
        const library = await Library.getById(id);
        if (!library) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        const uploadedFiles = [];

        // Upload files to Telegram
        for (const file of files) {
            try {
                const message = await bot.telegram.sendDocument(STORAGE_CHAT_ID, {
                    source: file.path,
                    filename: file.originalname
                }, {
                    caption: `📚 ${library.name} (Additional)\n${description ? `📝 ${description}` : ''}\n📄 ${file.originalname}`
                });

                uploadedFiles.push({
                    telegram_file_id: message.document.file_id,
                    telegram_message_id: message.message_id,
                    original_name: file.originalname,
                    file_size: file.size,
                    mime_type: file.mimetype
                });

                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Error uploading to Telegram:', error);
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        // Add to database
        await Library.addFiles(id, uploadedFiles);
        
        // Update total files count
        const newTotal = library.total_files + uploadedFiles.length;
        await db.query("UPDATE library SET total_files = $1 WHERE id = $2", [newTotal, id]);

        res.status(200).json({
            status: 200,
            message: `${uploadedFiles.length} files added to library`,
            added_files: uploadedFiles.length
        });

    } catch (error) {
        console.error('Add files error:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to add files'
        });
    }
},

// Update library details
async updateLibrary(req, res) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 400,
                message: 'Name is required'
            });
        }

        const library = await Library.getById(id);
        if (!library) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        await db.query(
            "UPDATE library SET name = $1, description = $2 WHERE id = $3",
            [name, description, id]
        );

        res.status(200).json({
            status: 200,
            message: "Library updated successfully"
        });

    } catch (error) {
        console.error('Update library error:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to update library'
        });
    }
},

// Remove single file from library
async removeFileFromLibrary(req, res) {
    try {
        const { fileId } = req.params;

        // Get file info
        const result = await db.query(
            "SELECT lf.*, l.total_files FROM library_files lf JOIN library l ON lf.library_id = l.id WHERE lf.id = $1",
            [fileId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "File not found"
            });
        }

        const file = result.rows[0];

        // Delete from Telegram
        try {
            await bot.telegram.deleteMessage(STORAGE_CHAT_ID, file.telegram_message_id);
        } catch (error) {
            console.error('Error deleting from Telegram:', error);
        }

        // Delete from database
        await db.query("DELETE FROM library_files WHERE id = $1", [fileId]);
        
        // Update total files count
        const newTotal = file.total_files - 1;
        await db.query("UPDATE library SET total_files = $1 WHERE id = $2", [newTotal, file.library_id]);

        res.status(200).json({
            status: 200,
            message: "File removed successfully"
        });

    } catch (error) {
        console.error('Remove file error:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to remove file'
        });
    }
},

// Download entire library as zip
async downloadLibrary(req, res) {
    try {
        const { id } = req.params;
        
        // Get library info
        const library = await Library.getById(id);
        if (!library) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        // Get all files in library
        const files = await Library.getFiles(id);
        if (files.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No files found in library"
            });
        }

        // Set response headers for zip download
        const zipFileName = `${library.name.replace(/[^a-zA-Z0-9]/g, '_')}_library.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

        // Create zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });

        // Pipe archive to response
        archive.pipe(res);

        // Download and add each file to zip
        for (const file of files) {
            try {
                // Get Telegram file path
                const tgFile = await bot.telegram.getFile(file.telegram_file_id);
                const telegramFileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${tgFile.file_path}`;

                // Download file from Telegram
                const response = await axios({
                    url: telegramFileUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                // Add to zip with original filename
                archive.append(response.data, { name: file.original_name });

            } catch (error) {
                console.error(`Error adding file ${file.original_name} to zip:`, error);
                // Continue with other files even if one fails
            }
        }

        // Finalize the archive
        archive.finalize();

        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    status: 500,
                    message: 'Failed to create zip file'
                });
            }
        });

    } catch (error) {
        console.error('Download library error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                status: 500,
                message: 'Failed to download library'
            });
        }
    }
}

};

module.exports = libraryController;