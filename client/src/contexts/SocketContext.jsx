import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: async () => {
      const res = await userAPI.getCurrentUserProfile();
      if (res?.error || res?.success === false) {
        throw new Error(res?.data?.message || "Failed to load profile");
      }
      return res?.data ?? res;
    },
  });

  useEffect(() => {
    // Don't create socket if no user data or socket already exists
    if (!userData?.id || socket) return;

    const newSocket = io("http://localhost:3000", {
      query: { username: userData?.username, userId: userData?.id },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.close();
    };
  }, [userData?.id]); // Only recreate if userId changes

  return (
    <SocketContext.Provider value={{ socket, isConnected, userData }}>
      {children}
    </SocketContext.Provider>
  );
};
