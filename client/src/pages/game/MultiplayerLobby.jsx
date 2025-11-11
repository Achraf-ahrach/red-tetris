import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  Crown,
  Gamepad2,
  Loader2,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
} from "lucide-react";
import socketService from "@/services/socketService";

/**
 * Multiplayer Lobby - Create or Join Game Rooms
 */
export default function MultiplayerLobby() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        requestRoomList();
      } catch (error) {}
    };

    connectSocket();

    return () => {};
  }, []);

  // Listen for room updates
  useEffect(() => {
    if (!isConnected) return;

    const handleRoomListUpdate = (rooms) => {
      setAvailableRooms(rooms);
      setIsLoading(false);
    };

    const handleRoomCreated = ({ roomId, roomName }) => {
      setIsCreating(false);

      // Generate shareable URL with room name format: /<room>/<player>
      const shareUrl = `${window.location.origin}/${encodeURIComponent(
        roomName
      )}/${encodeURIComponent(user.username)}`;

      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).catch(() => {
        console.log("Could not copy to clipboard");
      });

      // Auto-join the room (creator joins automatically)
      navigate(
        `/${encodeURIComponent(roomName)}/${encodeURIComponent(user.username)}`,
        {
          state: { room: { roomName }, roomId },
        }
      );
    };

    const handleRoomJoined = ({ roomId, room }) => {
      // Navigate to game using URL format: /<room>/<player>
      navigate(
        `/${encodeURIComponent(room.roomName)}/${encodeURIComponent(
          user.username
        )}`,
        {
          state: { room, roomId },
        }
      );
    };

    const handleError = ({ message }) => {
      alert(message);
      setIsCreating(false);
    };

    socketService._on("room-list", handleRoomListUpdate);
    socketService._on("room-created", handleRoomCreated);
    socketService._on("room-joined", handleRoomJoined);
    socketService._on("error", handleError);

    return () => {
      socketService._off("room-list", handleRoomListUpdate);
      socketService._off("room-created", handleRoomCreated);
      socketService._off("room-joined", handleRoomJoined);
      socketService._off("error", handleError);
    };
  }, [isConnected, navigate]);

  const requestRoomList = () => {
    setIsLoading(true);
    socketService._emit("get-room-list");
  };

  const createRoom = () => {
    if (!newRoomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    setIsCreating(true);
    socketService._emit("create-room", {
      roomName: newRoomName.trim(),
      creatorId: user.id,
      creatorUsername: user.username,
    });

    setNewRoomName("");
    setShowCreateModal(false);
  };

  const joinRoom = (roomId) => {
    socketService._emit("join-room", {
      roomId,
      userId: user.id,
      username: user.username,
    });
  };

  const filteredRooms = availableRooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Multiplayer Lobby
              </h1>
              <p className="text-muted-foreground mt-2">
                Create a game room or join an existing one
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="px-3 py-1"
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search rooms or players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={requestRoomList} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Room List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <Card className="p-12 text-center">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "No rooms match your search"
                  : "Be the first to create a game room!"}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.roomId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">
                              {room.roomName}
                            </h3>
                            <Badge
                              variant={
                                room.status === "waiting"
                                  ? "secondary"
                                  : room.status === "playing"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {room.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Crown className="w-4 h-4" />
                              <span>{room.creator.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {room.players.length} / {room.maxPlayers}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(room.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => joinRoom(room.roomId)}
                          disabled={
                            room.status !== "waiting" ||
                            room.players.length >= room.maxPlayers
                          }
                        >
                          {room.status === "playing" ? (
                            "In Progress"
                          ) : room.players.length >= room.maxPlayers ? (
                            "Full"
                          ) : (
                            <>
                              Join Game <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => !isCreating && setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Game Room</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Room Name
                      </label>
                      <Input
                        placeholder="Enter room name..."
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && createRoom()}
                        disabled={isCreating}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowCreateModal(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={createRoom}
                        disabled={isCreating || !newRoomName.trim()}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
