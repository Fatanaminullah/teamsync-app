"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useChat } from "@/lib/hooks/useChat";
import { useChatStore } from "@/lib/store";

const Chat = ({ token }: { token: string | null }) => {
  const { sendMessage, onlineUsers } = useChat(token);
  const { messages } = useChatStore();
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string>("room");

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message, activeChat === "room" ? undefined : activeChat);
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        <Button
          variant={activeChat === "room" ? "default" : "outline"}
          onClick={() => setActiveChat("room")}
          className="w-full mb-2"
        >
          Group Chat
        </Button>
        <h3 className="text-sm font-semibold mb-2">Private Chats</h3>
        {Object.entries(onlineUsers).map(([name, user]) => (
          <Button
            key={user.socketId}
            variant={activeChat === user.socketId ? "default" : "outline"}
            onClick={() => setActiveChat(user.socketId)}
            className="w-full mb-2"
          >
            {name}
          </Button>
        ))}
      </aside>

      {/* Chat Window */}
      <main className="flex-1 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">
          {activeChat === "room" ? "Group Chat" : `Chat with ${activeChat}`}
        </h2>
        <Card className="flex-1 overflow-y-auto p-4">
          <CardContent>
            {messages
              .filter(
                (msg) =>
                  msg.to === "room" ||
                  msg.to === activeChat ||
                  msg.name === activeChat
              )
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.name === "You" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="font-bold">{msg.name}:</span> {msg.content}
                </div>
              ))}
          </CardContent>
        </Card>
        <div className="flex mt-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
            placeholder="Type a message..."
          />
          <Button onClick={handleSend} className="ml-2">
            Send
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Chat;
