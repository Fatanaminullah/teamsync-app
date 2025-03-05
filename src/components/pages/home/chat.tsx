"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/lib/hooks/useSocket";
import { useAuthStore, useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PhoneIncoming, PhoneOff, UserCircle, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ReactPlayer from "react-player";

import logoMain from "@/public/img/img_logo-main.png";

const Chat = ({ token }: { token: string | null }) => {
  const {
    sendMessage,
    onlineUsers,
    socketId,

    callState,
    caller,
    acceptCall,
    startCall,
    rejectCall,
    endCall,
    remoteStream,
    myStream,
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
  console.log("remote", remoteStream);
  // console.log("my", myStream);
  // console.log("call", callState);
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
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold mb-4">{`${activeChat}`}</h2>
            <button
              onClick={() => {
                startCall(activeChat);
              }}
            >
              <Video />
            </button>
          </div>
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

      {/* Video Call UI */}
      {callState === "receiving" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <PhoneIncoming className="w-12 h-12 text-green-500" />
            <p className="font-bold text-lg">{caller} is calling...</p>
            <div className="flex space-x-4 mt-4">
              <Button onClick={acceptCall} className="bg-green-500 text-white">
                Accept
              </Button>
              <Button onClick={rejectCall} className="bg-red-500 text-white">
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {callState === "in-call" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-[80vw] h-[80vh] bg-gray-900 rounded-lg p-4 flex flex-col items-center">
            <div className="relative w-full flex-1">
              {/* Remote Video */}
              <div className="w-full h-full bg-black rounded-lg">
                {remoteStream && (
                  <video
                    ref={(video) => {
                      if (video) {
                        video.srcObject = remoteStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full"
                  />
                )}
              </div>
              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border border-white">
                {myStream && (
                  <video
                    ref={(video) => {
                      if (video) {
                        video.srcObject = myStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
            <Button
              onClick={endCall}
              className="mt-4 bg-red-500 text-white flex items-center"
            >
              <PhoneOff className="mr-2" /> End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
