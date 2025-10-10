import express from "express";

const router = express.Router();

// This will be injected when the routes are set up
let socketHandler = null;

export const setSocketHandler = (handler) => {
  socketHandler = handler;
};

// Get all rooms
router.get("/rooms", (req, res) => {
  if (!socketHandler) {
    return res.status(500).json({
      success: false,
      message: "Socket handler not initialized",
    });
  }

  const rooms = socketHandler.getRooms();
  res.json({
    success: true,
    data: rooms,
  });
});

// Get specific room info
// router.get('/rooms/:roomId', (req, res) => {
//   if (!socketHandler) {
//     return res.status(500).json({
//       success: false,
//       message: 'Socket handler not initialized'
//     });
//   }

//   const { roomId } = req.params;
//   const room = socketHandler.getRoom(roomId);

//   if (!room) {
//     return res.status(404).json({
//       success: false,
//       message: 'Room not found'
//     });
//   }

//   res.json({
//     success: true,
//     data: room
//   });
// });

// Health check for socket server
// router.get('/socket/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Socket server is running',
//     timestamp: new Date().toISOString()
//   });
// });

export default router;
