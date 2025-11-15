import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./src/config/passport.js";
import routes from "./src/routes/index.js";
import { setupSocketHandlers } from "./src/config/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// CORS configuration - optimized to reduce preflight requests
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable Passport (stateless)
app.use(passport.initialize());

// Routes
app.use("/api", routes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Red Tetris API Server",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Only log errors in development
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

httpServer.listen(PORT, () => {
  console.log(`Red Tetris Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO enabled for real-time multiplayer`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
