// import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { SOCKET_URL } from "../constant";
// import { useAuthStore, useChatStore } from "../store";

// interface Message {
//   name: string;
//   content: string;
// }

// interface User {
//   online: boolean;
//   socketId: string;
// }

// interface UsersInRoom {
//   [name: string]: User;
// }

// export const useChat = (token: string | null) => {
//   const { user } = useAuthStore();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [users, setUsers] = useState<UsersInRoom>({});

//   useEffect(() => {
//     if (!token) return;
//     console.log("token", token);
//     const newSocket = io(SOCKET_URL, {
//       extraHeaders: { authorization: `Bearer ${token}` },
//     });

//     newSocket.on("connect", () => {
//       console.log("Connected to WebSocket server");
//     });

//     newSocket.on("message", (message: Message) => {
//       console.log("messs", message);
//       setMessages((prev) => [...prev, message]);
//     });

//     newSocket.on("roomUsers", (usersInRoom: UsersInRoom) => {
//       setUsers(usersInRoom);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from WebSocket server");
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token]);

//   const sendMessage = (content: string, recipient?: string) => {
//     if (!user) return;

//     const message = {
//       content,
//       name: user.name,
//       to: recipient || "room",
//     };

//     socket.emit("message", message);
//     addMessage(message);
//   };

//   return { messages, users, sendMessage };
// };

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore, useChatStore } from "../store";
import { SOCKET_URL } from "../constant";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const useChat = (token: string | null) => {
  const { user } = useAuthStore();
  const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    newSocket.auth = { token };
    newSocket.connect();

    newSocket.on("roomUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("message", (message) => {
      addMessage(message);
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = (content: string, recipient?: string) => {
    if (!user) return;

    const message = {
      content,
      name: user.name,
      to: recipient || "room",
    };

    socket?.emit("message", message);
    addMessage(message);
  };

  return { sendMessage, onlineUsers };
};
