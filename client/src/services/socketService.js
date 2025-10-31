/**
 * Socket Service - Encapsulated Socket.IO Client
 *
 * This service provides a clean API for socket operations.
 * Components should use this service instead of directly accessing socket.io
 */

import { io } from "socket.io-client";

// Use VITE_API_URL if available, otherwise extract base URL from VITE_API_BASE
const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE?.replace("/api", "") ||
  "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Connect to Socket.IO server
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      // Connection events
      this.socket.on("connect", () => {
        this.isConnected = true;
        this.connectionCallbacks.forEach((cb) => cb(this.socket.id));
        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        this.disconnectionCallbacks.forEach((cb) => cb(reason));
      });

      this.socket.on("connect_error", (error) => {
        this.isConnected = false;
        this.errorCallbacks.forEach((cb) => cb(error));
        reject(error);
      });
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * Register callback for connection event
   * @param {Function} callback
   */
  onConnect(callback) {
    if (typeof callback === "function") {
      this.connectionCallbacks.push(callback);
    }
  }

  /**
   * Register callback for disconnection event
   * @param {Function} callback
   */
  onDisconnect(callback) {
    if (typeof callback === "function") {
      this.disconnectionCallbacks.push(callback);
    }
  }

  /**
   * Register callback for error event
   * @param {Function} callback
   */
  onError(callback) {
    if (typeof callback === "function") {
      this.errorCallbacks.push(callback);
    }
  }

  /**
   * Internal method to emit events
   * @private
   */
  _emit(event, data) {
    if (!this.socket || !this.isConnected) {
      return false;
    }
    this.socket.emit(event, data);
    return true;
  }

  /**
   * Internal method to listen to events
   * @private
   */
  _on(event, handler) {
    if (!this.socket) {
      return;
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);

    // Wrap handler
    const wrappedHandler = (...args) => {
      handler(...args);
    };

    this.socket.on(event, wrappedHandler);
  }

  /**
   * Internal method to remove event listener
   * @private
   */
  _off(event, handler) {
    if (!this.socket) return;

    this.socket.off(event, handler);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an event
   * @private
   */
  _removeAllListeners(event) {
    if (!this.socket) return;

    if (event) {
      this.socket.off(event);
      this.listeners.delete(event);
    } else {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export the singleton instance
export default socketService;
