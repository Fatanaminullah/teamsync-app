"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/lib/hooks/useSocket";
import { useAuthStore, useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  UserCircle,
  Video,
  VideoOff,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { sanitizeInput } from "@/lib/utils/sanitize";
import logoMainDark from "@/public/img/img_logo-inverted.png";
import logoMain from "@/public/img/img_logo-main.png";
import { useTheme } from "next-themes";

const Chat = ({ token }: { token: string | null }) => {
  const { theme } = useTheme();
  const {
    sendMessage,
    onlineUsers,

    callState,
    caller,
    acceptCall,
    startCall,
    rejectCall,
    endCall,
    remoteStream,
    myStream,
    isAudioEnabled,
    isVideoEnabled,
    handleToggleAudio,
    handleToggleVideo,
  } = useSocket(token);

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
  console.log("CALL STATE", callState);
  return (
    <div className="flex h-[calc(100svh_-_100px)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "md:w-64 w-full md:bg-gray-100 dark:md:bg-gray-800 md:p-4",
          activeChat ? "max-md:invisible max-md:hidden" : ""
        )}
      >
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        {Object.entries(onlineUsers)
          ?.filter(([name]) => name !== userAuth.name)
          .map(([name, user]) => (
            <div
              key={user.socketId}
              className="max-md:pb-1 max-md:border-b max-md:border-gray-200"
            >
              <Button
                variant={activeChat === name ? "outline" : "ghost"}
                onClick={() => setActiveChat(name)}
                className="px-2 w-full !h-20 hover:!bg-background flex items-center justify-start"
              >
                <div className="relative">
                  <UserCircle className="!w-10 !h-10" />
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full absolute bottom-0 right-0",
                      user.online ? "bg-green-500" : "bg-slate-400"
                    )}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <p className="font-bold">{name}</p>
                  <p>
                    {
                      messages?.findLast(
                        (item) =>
                          item.content.from === name ||
                          (item.content.to === name &&
                            item.content.from === userAuth.name)
                      )?.content.content
                    }
                  </p>
                </div>
              </Button>
            </div>
          ))}
      </aside>

      {/* Chat Window */}
      {activeChat ? (
        <div
          className={cn(
            "flex-1 md:p-4 flex flex-col max-md:translate-x-full transition-transform",
            activeChat ? "max-md:translate-x-0" : ""
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1">
              <ChevronLeft
                className="md:hidden"
                onClick={() => setActiveChat("")}
              />
              <UserCircle className="!w-10 !h-10 md:hidden" />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold">{`${activeChat}`}</h2>
                <p className="text-xs md:hidden">
                  {onlineUsers?.[activeChat]?.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                startCall(activeChat);
              }}
            >
              <Video />
            </button>
          </div>
          <Card className="flex-1 overflow-y-auto md:p-4 py-4">
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
                      {sanitizeInput(msg.content.content)}
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
        <div className="max-md:hidden max-md:invisible flex flex-1 flex-col items-center justify-center">
          <Image
            src={theme === "dark" ? logoMainDark : logoMain}
            alt="Image"
            className="w-60"
          />
          <h2>TeamSync App</h2>
        </div>
      )}

      {/* Video Call UI */}
      {callState === "receiving" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <PhoneIncoming className="w-12 h-12 text-green-500" />
            <p className="font-bold dark:text-black text-lg">
              {caller} is calling...
            </p>
            <div className="flex space-x-4 mt-4">
              <Button onClick={acceptCall} variant="success">
                Accept
              </Button>
              <Button onClick={rejectCall} variant="destructive">
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
      {callState === "calling" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <PhoneOutgoing className="w-12 h-12 text-green-500" />
            <p className="font-bold dark:text-black text-lg">
              Calling {activeChat}...
            </p>
          </div>
        </div>
      )}

      {callState === "in-call" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-[100vw] h-[100vh] bg-gray-900 md:p-4 flex flex-col items-center">
            <div className="relative w-full h-full">
              {/* Remote Video */}
              <div className="w-full h-full bg-black ">
                {remoteStream && (
                  <video
                    ref={(video) => {
                      if (video) {
                        video.srcObject = remoteStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover md:rounded-lg"
                    style={{ transform: "scaleX(-1)", objectFit: "contain" }}
                    muted={!isAudioEnabled}
                  />
                )}
              </div>
              {/* Local Video */}
              <div className="absolute max-md:top-4 md:bottom-4 right-4 w-32 md:w-60 h-48 rounded-lg">
                {myStream && (
                  <video
                    ref={(video) => {
                      if (video) {
                        video.srcObject = myStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                    style={{ transform: "scaleX(-1)" }}
                    muted={!isAudioEnabled}
                  />
                )}
              </div>
            </div>
            <div className="absolute bottom-10 mt-4 flex justify-center gap-4">
              <Button
                onClick={handleToggleAudio}
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12",
                  !isAudioEnabled && "bg-gray-500 hover:bg-gray-600"
                )}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>

              <Button
                onClick={handleToggleVideo}
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12",
                  !isVideoEnabled && "bg-gray-500 hover:bg-gray-600"
                )}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>

              <Button
                onClick={endCall}
                size="icon"
                className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
              >
                <PhoneOff />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
