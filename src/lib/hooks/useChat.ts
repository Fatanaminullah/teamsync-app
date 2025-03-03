import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore, useChatStore } from "../store";
import { SOCKET_URL } from "../constant";
import { toast } from "sonner";

export const useChat = (token: string | null) => {
  const { user } = useAuthStore();
  const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("roomUsers", (users) => {
      console.log("room", users);
      setOnlineUsers(users);
    });

    newSocket.on("message", (message) => {
      console.log("incoming!", message);
      toast(message?.name, {
        description: message?.content?.content,
        duration: 10000,
      });
      addMessage(message);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);
  const sendMessage = (content: string, recipient?: string) => {
    if (!user) return;

    const message = {
      name: user.name,
      content: {
        to: recipient!,
        from: user.name,
        content,
      },
    };

    socket?.emit("message", message);
    addMessage(message);
  };

  return { sendMessage, onlineUsers, socketId: socket?.id };
};
