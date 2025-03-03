import { create } from "zustand";
import { persist } from "zustand/middleware";

type Message = {
  name: string;
  content: string;
  to: string; // "room" for group chat, socketId for private chat
};

type ChatState = {
  messages: Message[];
  onlineUsers: Record<string, { online: boolean; socketId: string }>;
  addMessage: (message: Message) => void;
  setOnlineUsers: (
    users: Record<string, { online: boolean; socketId: string }>
  ) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      onlineUsers: {},
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setOnlineUsers: (users) => set(() => ({ onlineUsers: users })),
    }),
    { name: "chat-storage" }
  )
);
