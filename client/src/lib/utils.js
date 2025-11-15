import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full URL for an avatar
 * @param {string} avatarPath - The avatar path from the API (can be relative or absolute)
 * @returns {string} - Full URL to the avatar
 */

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) {
    return "/placeholder.svg";
  }

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // /uploads/avatar_name
  if (avatarPath.startsWith("/uploads/")) {
    const apiServer = import.meta.env.VITE_API_BASE || "http://localhost:3000";
    // Remove /api from the end if present
    const serverUrl = apiServer.replace(/\/api$/, "");
    return `${serverUrl}${avatarPath}`;
  }

  return avatarPath;
}
