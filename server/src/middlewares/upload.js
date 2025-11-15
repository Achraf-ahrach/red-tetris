import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(__dirname, "..", "..", "uploads", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for avatar uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer destination called");
    // Temporary upload directory
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    console.log("Multer filename called for:", file.originalname);
    // Generate temporary filename
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;
    const extension = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${extension}`);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  console.log("Multer fileFilter called with mimetype:", file.mimetype);
  // Accepted image types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("File type accepted");
    cb(null, true);
  } else {
    console.log("File type rejected");
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
      ),
      false
    );
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  console.log("handleUploadError called with error:", err?.message);
  if (err instanceof multer.MulterError) {
    console.log("Multer error code:", err.code);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    console.log("Non-multer error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Error uploading file",
    });
  }
  console.log("No error, calling next()");
  next();
};
