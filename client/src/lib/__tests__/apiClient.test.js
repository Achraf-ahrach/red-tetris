/**
 * API Client Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiGet, apiPost, apiPut, apiDelete } from "../apiClient";
import axios from "axios";

// Mock axios
vi.mock("axios");

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("apiClient helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe("apiGet", () => {
    it("should return data on successful GET request", async () => {
      const mockData = { id: 1, name: "test" };
      const mockResponse = { data: mockData };
      
      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiGet("/test");
      
      expect(result).toEqual(mockData);
    });

    it("should return error object on failed GET request", async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: "Not found" },
        },
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiGet("/test");
      
      expect(result.error).toBe(true);
      expect(result.status).toBe(404);
    });
  });

  describe("apiPost", () => {
    it("should return data on successful POST request", async () => {
      const mockData = { success: true };
      const mockResponse = { data: mockData };
      
      axios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiPost("/test", { name: "test" });
      
      expect(result).toEqual(mockData);
    });

    it("should return error object on failed POST request", async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: "Bad request" },
        },
      };

      axios.create = vi.fn(() => ({
        post: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiPost("/test", {});
      
      expect(result.error).toBe(true);
      expect(result.status).toBe(400);
    });
  });

  describe("apiPut", () => {
    it("should return data on successful PUT request", async () => {
      const mockData = { updated: true };
      const mockResponse = { data: mockData };
      
      axios.create = vi.fn(() => ({
        put: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiPut("/test", { name: "updated" });
      
      expect(result).toEqual(mockData);
    });

    it("should return error object on failed PUT request", async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: "Server error" },
        },
      };

      axios.create = vi.fn(() => ({
        put: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiPut("/test", {});
      
      expect(result.error).toBe(true);
      expect(result.status).toBe(500);
    });
  });

  describe("apiDelete", () => {
    it("should return data on successful DELETE request", async () => {
      const mockData = { deleted: true };
      const mockResponse = { data: mockData };
      
      axios.create = vi.fn(() => ({
        delete: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiDelete("/test");
      
      expect(result).toEqual(mockData);
    });

    it("should return error object on failed DELETE request", async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: "Forbidden" },
        },
      };

      axios.create = vi.fn(() => ({
        delete: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiDelete("/test");
      
      expect(result.error).toBe(true);
      expect(result.status).toBe(403);
    });
  });

  describe("error handling without response", () => {
    it("should handle errors without response object", async () => {
      const mockError = new Error("Network error");

      axios.create = vi.fn(() => ({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }));

      const result = await apiGet("/test");
      
      expect(result.error).toBe(true);
      expect(result.status).toBeUndefined();
    });
  });
});
