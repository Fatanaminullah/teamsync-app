"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useChat } from "@/lib/hooks/useChat";
import { useAuthStore, useChatStore } from "@/lib/store";
import { CircleOff, Dot, UserCircle } from "lucide-react";
import Image from "next/image";

import logoMain from "../../../../public/img/img_logo-main.png";
import { cn } from "@/lib/utils";

const Chat = ({ token }: { token: string | null }) => {
  const { sendMessage, onlineUsers, socketId } = useChat(token);
  const { user: userAuth } = useAuthStore();
  const { messages } = useChatStore();
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string>();

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message, activeChat);
      setMessage("");
    }
  };
  console.log(
    "meesss",
    messages.filter(
      (msg) =>
        (msg.content.to === activeChat && msg.content.from === userAuth.name) ||
        (msg.content.to === userAuth.name && msg.content.from === activeChat)
    )
  );
  return (
    <div className="flex h-[calc(100vh_-_100px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        {Object.entries(onlineUsers)
          ?.filter(([name, user]) => name !== userAuth.name)
          .map(([name, user]) => (
            <Button
              key={user.socketId}
              variant={activeChat === name ? "outline" : "ghost"}
              onClick={() => setActiveChat(name)}
              className="px-2 w-full !h-20 hover:!bg-background flex items-center justify-start"
            >
              {user.online ? (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              ) : (
                ""
              )}
              <UserCircle className="!w-10 !h-10" />
              <div className="flex flex-col items-start">
                <p className="font-bold">{name}</p>
                <p>
                  {
                    messages?.findLast((item) => item.content.from === name)
                      ?.content.content
                  }
                </p>
              </div>
            </Button>
          ))}
      </aside>

      {/* Chat Window */}
      {activeChat ? (
        <div className="flex-1 p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">{`Chat with ${activeChat} ${
            Object.entries(onlineUsers).find(
              ([name, user]) => name === activeChat
            )?.[0]
          }`}</h2>
          <Card className="flex-1 overflow-y-auto p-4 h-4/6">
            <CardContent>
              {messages
                .filter(
                  (msg) =>
                    (msg.content.to === activeChat &&
                      msg.content.from === userAuth.name) ||
                    (msg.content.to === userAuth.name &&
                      msg.content.from === activeChat)
                )
                .map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 flex ${
                      msg.content.from === userAuth.name
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-md flex flex-col w-fit",
                        msg.content.from === userAuth.name
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {msg.content.from !== userAuth.name && (
                        <span className="font-bold">{msg.name}:</span>
                      )}
                      {msg.content.content}
                    </div>
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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} className="ml-2">
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Image src={logoMain} alt="Image" className="w-60" />
          <h2>TeamSync App</h2>
        </div>
      )}
    </div>
  );
};

export default Chat;
