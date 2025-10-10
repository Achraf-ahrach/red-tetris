import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import passport from "./src/config/passport.js";
import routes from "./src/routes/index.js";
import SocketHandler from "./src/socket/socketHandler.js";
import { setSocketHandler } from "./src/routes/socketRoutes.js";

const app = express();
const server = createServer(app);
const socketHandler = new SocketHandler();
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
socketHandler.initialize(server);

// Inject socket handler into routes
setSocketHandler(socketHandler);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Passport (stateless)
app.use(passport.initialize());

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Red Tetris API Server",
    version: "1.0.0",
    documentation: "/api/health",
    socket: "Socket.IO enabled for real-time gaming",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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

server.listen(PORT, () => {
  console.log(`Red Tetris Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.IO server initialized and ready for connections`);
});
