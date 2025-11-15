import { describe, it, expect, beforeEach } from "vitest";
import { cn, getAvatarUrl } from "../utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("should handle false conditional classes", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).not.toContain("active-class");
  });

  it("should merge conflicting tailwind classes correctly", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["text-sm", "font-bold"]);
    expect(result).toContain("text-sm");
    expect(result).toContain("font-bold");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle undefined and null values", () => {
    const result = cn("valid-class", undefined, null, "another-class");
    expect(result).toContain("valid-class");
    expect(result).toContain("another-class");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({
      "class-1": true,
      "class-2": false,
      "class-3": true,
    });
    expect(result).toContain("class-1");
    expect(result).not.toContain("class-2");
    expect(result).toContain("class-3");
  });
});

describe("getAvatarUrl utility", () => {
  beforeEach(() => {
    delete import.meta.env.VITE_API_BASE;
  });

  it("should return placeholder for null or empty avatar", () => {
    expect(getAvatarUrl(null)).toBe("/placeholder.svg");
    expect(getAvatarUrl("")).toBe("/placeholder.svg");
    expect(getAvatarUrl(undefined)).toBe("/placeholder.svg");
  });

  it("should return absolute http URL as-is", () => {
    const url = "http://example.com/avatar.jpg";
    expect(getAvatarUrl(url)).toBe(url);
  });

  it("should return absolute https URL as-is", () => {
    const url = "https://example.com/avatar.jpg";
    expect(getAvatarUrl(url)).toBe(url);
  });

  it("should prepend server URL for /uploads/ paths", () => {
    const avatarPath = "/uploads/avatar_123.jpg";
    const result = getAvatarUrl(avatarPath);
    expect(result).toBe("http://localhost:3000/uploads/avatar_123.jpg");
  });

  it("should handle custom API base URL", () => {
    import.meta.env.VITE_API_BASE = "http://api.example.com/api";
    const avatarPath = "/uploads/avatar_456.jpg";
    const result = getAvatarUrl(avatarPath);
    expect(result).toBe("http://api.example.com/uploads/avatar_456.jpg");
  });

  it("should return relative paths as-is if not /uploads/", () => {
    const relativePath = "/images/default.png";
    expect(getAvatarUrl(relativePath)).toBe(relativePath);
  });
});
