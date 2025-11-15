import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AvatarService {
  constructor() {
    // Path to avatars directory
    this.avatarsDir = path.join(__dirname, "..", "..", "uploads", "avatars");
  }

  /**
   * Ensure avatars directory exists
   */
  async ensureDirectoryExists() {
    try {
      await fs.access(this.avatarsDir);
    } catch {
      await fs.mkdir(this.avatarsDir, { recursive: true });
    }
  }

  /**
   * Download an image from a URL and save it locally
   * @param {string} imageUrl - The URL of the image to download
   * @param {string} userId - The user ID (for filename uniqueness)
   * @returns {Promise<string>} - The relative path to the saved image
   */
  async downloadAndSaveAvatar(imageUrl, userId) {
    try {
      if (!imageUrl) {
        throw new Error("No image URL provided");
      }

      // Ensure directory exists
      await this.ensureDirectoryExists();

      // Fetch the image
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download image: ${response.status} ${response.statusText}`
        );
      }

      // Get the content type to determine file extension
      const contentType = response.headers.get("content-type");
      const extension = this.getExtensionFromContentType(contentType);

      // Generate a unique filename
      const timestamp = Date.now();
      const hash = crypto.randomBytes(8).toString("hex");
      const filename = `${userId}_${timestamp}_${hash}${extension}`;
      const filepath = path.join(this.avatarsDir, filename);

      // Download and save the image
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filepath, buffer);

      // Return the relative URL path
      return `/uploads/avatars/${filename}`;
    } catch (error) {
      console.error("Error downloading avatar:", error);
      throw error;
    }
  }

  /**
   * Get file extension from content type
   * @param {string} contentType - The content type header
   * @returns {string} - File extension with dot
   */
  getExtensionFromContentType(contentType) {
    if (!contentType) return ".jpg";

    const typeMap = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };

    return typeMap[contentType.toLowerCase()] || ".jpg";
  }

  /**
   * Save an uploaded avatar file
   * @param {Object} file - The uploaded file from multer
   * @param {string} userId - The user ID (for filename uniqueness)
   * @returns {Promise<string>} - The relative path to the saved image
   */
  async saveUploadedAvatar(file, userId) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      // Ensure directory exists
      await this.ensureDirectoryExists();

      // Generate a unique filename
      const timestamp = Date.now();
      const hash = crypto.randomBytes(8).toString("hex");
      const extension = path.extname(file.originalname) || ".jpg";
      const filename = `${userId}_${timestamp}_${hash}${extension}`;
      const filepath = path.join(this.avatarsDir, filename);

      // Move the uploaded file to the avatars directory
      await fs.rename(file.path, filepath);

      // Return the relative URL path
      return `/uploads/avatars/${filename}`;
    } catch (error) {
      console.error("Error saving uploaded avatar:", error);
      // Clean up the uploaded file if it exists
      if (file?.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          // Ignore unlink errors
        }
      }
      throw error;
    }
  }

  /**
   * Delete an avatar file
   * @param {string} avatarPath - The relative path to the avatar
   */
  async deleteAvatar(avatarPath) {
    try {
      if (!avatarPath || !avatarPath.startsWith("/uploads/avatars/")) {
        return;
      }

      const filename = path.basename(avatarPath);
      const filepath = path.join(this.avatarsDir, filename);

      await fs.unlink(filepath);
    } catch (error) {
      // If file doesn't exist, that's fine
      if (error.code !== "ENOENT") {
        console.error("Error deleting avatar:", error);
      }
    }
  }

  /**
   * Check if an avatar path is a local file
   * @param {string} avatarPath - The avatar path
   * @returns {boolean}
   */
  isLocalAvatar(avatarPath) {
    return avatarPath && avatarPath.startsWith("/uploads/avatars/");
  }

  /**
   * Check if an avatar path is an external URL
   * @param {string} avatarPath - The avatar path
   * @returns {boolean}
   */
  isExternalAvatar(avatarPath) {
    return (
      avatarPath &&
      (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
    );
  }
}
