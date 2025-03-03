import { create } from "zustand";
import { persist } from "zustand/middleware";

type MessageContent = {
  content: string;
  to: string;
  from: string;
};

type Message = {
  name: string
  content: MessageContent;
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
