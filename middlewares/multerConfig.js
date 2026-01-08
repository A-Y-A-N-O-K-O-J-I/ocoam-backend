const multer = require("multer");

// Memory storage for Vercel
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

// Middleware for application document uploads
const uploadApplicationDocuments = upload.fields([
  { name: "passport_photo", maxCount: 1 },
  { name: "birth_certificate_or_attestation", maxCount: 1 },
  { name: "school_certificate", maxCount: 1 },
  { name: "practice_documentation", maxCount: 1 },
  { name: "medical_fitness_certificate", maxCount: 1 },
  { name: "recommendation_letter", maxCount: 1 },
  { name: "additional_certificates", maxCount: 1 },
]);

module.exports = { uploadApplicationDocuments };