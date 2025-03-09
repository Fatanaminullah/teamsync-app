/* eslint-disable react-hooks/exhaustive-deps */

import peer from "@/lib/service/peer";
import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { SOCKET_URL } from "../constant";
import { Message, useAuthStore, useChatStore } from "../store";

type CallState = "idle" | "calling" | "receiving" | "in-call" | "ending";

export const useSocket = (token: string | null) => {
  const { user } = useAuthStore();
  const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [callState, setCallState] = useState<CallState>("idle");
  const [caller, setCaller] = useState<string | null>(null);
  const [isAudioEnabled, setisAudioEnabled] = useState(true);
  const [isVideoEnabled, setisVideoEnabled] = useState(true);

  const sendMessage = (content: string, recipient?: string) => {
    if (!user) return;

    const message = {
      name: user.name,
      content: {
        to: recipient!,
        from: user.name,
        type: "chat",
        content,
      },
    };

    socket?.emit("message", message);
    addMessage(message);
  };

  const handleToggleAudio = () => {
    peer.toggleAudio();
    setisAudioEnabled(!isAudioEnabled);
  };

  const handleToggleVideo = () => {
    peer.toggleVideo();
    setisVideoEnabled(!isVideoEnabled);
  };

  const startCall = useCallback(
    async (to: string) => {
      if (socket) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setMyStream(stream);
          peer.addStream(stream); // Add stream before creating offer

          const offer = await peer.getOffer();
          socket.emit("message", {
            name: user.name,
            content: {
              to,
              from: user.name,
              type: "call",
              offer,
            },
          });
          setCaller(to);
          setCallState("calling");
        } catch (error) {
          console.error("Error starting call:", error);
        }
      }
    },
    [socket, user?.name]
  );

  const acceptCall = useCallback(async () => {
    if (socket && caller) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
        peer.addStream(stream); // Add stream before creating answer

        const offer = await peer.getOffer();
        socket.emit("message", {
          name: user.name,
          content: {
            to: caller,
            from: user.name,
            type: "call-accept",
            ans: offer,
          },
        });

        setCallState("in-call");
      } catch (error) {
        toast.error(`Error accepting call", ${JSON.stringify(error)}`);
        console.error("Error accepting call:", error);
      }
    }
  }, [socket, caller, user?.name]);

  const rejectCall = () => {
    if (!socket || !caller) return;

    socket.emit("message", {
      name: user.name,
      content: {
        to: caller,
        from: user.name,
        type: "call-reject",
      },
    });

    setCallState("idle");
  };

  const endCall = () => {
    console.log("ENDING CALL", myStream, remoteStream);
    peer?.peer?.close();

    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(undefined);
    }

    setRemoteStream(undefined);

    socket?.emit("message", {
      name: user.name,
      content: {
        to: caller,
        from: user.name,
        type: "call-end",
      },
    });
    peer.toggleVideo();
    peer.toggleAudio();

    setCallState("idle");
  };

  const handleIncomingCall = async ({
    content,
    socket,
  }: Message & { socket: Socket }) => {
    const { offer, from } = content;
    setCaller(from);
    setCallState("receiving");
    console.log(`incoming call from ${from} with offer ${offer}`);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket?.emit("message", {
      name: user.name,
      content: {
        to: caller,
        from: user.name,
        type: "call-received",
        ans,
      },
    });
  };

  const sendStreams = useCallback(() => {
    if (myStream) {
      console.log("Sending streams to peer");
      peer.addStream(myStream);
    } else {
      console.warn("No local stream available to send");
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ content }: Message) => {
      const { ans } = content;
      peer.setRemoteDescription(ans, "handleCallAccepted");
      console.log("Call Accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleCallReceived = useCallback(
    ({ content: { ans } }: Message) => {
      peer.setRemoteDescription(ans, "handleCallReceived");
      console.log("Call Accepted by Caller!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleCallEnded = () => {
    // Clean up for both users
    console.log("CALL ENDED", myStream, remoteStream);
    peer?.peer?.close();
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(undefined);
    setRemoteStream(undefined);

    peer.toggleVideo();
    peer.toggleAudio();

    setCallState("idle");
  };

  const handleNegoNeededIncoming = useCallback(
    async ({ content, socket }: Message & { socket: Socket }) => {
      const { offer, from } = content;
      const ans = await peer.getAnswer(offer);
      socket?.emit("message", {
        name: user.name,
        content: {
          to: from,
          from: user.name,
          type: "nego-final",
          ans,
        },
      });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ content: { ans } }: Message) => {
    await peer.setRemoteDescription(ans, "handleNegoFinal");
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(SOCKET_URL, {
      secure: true,
      rejectUnauthorized: true,
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("roomUsers", (users) => {
      setOnlineUsers(users);
    });
    newSocket.on("message", async (message: Message) => {
      switch (message.content.type) {
        case "chat":
          if (message.content.to !== user.name) return;
          toast(message?.name, {
            description: message?.content?.content,
            duration: 5000,
            closeButton: true,
          });
          addMessage(message);
          break;
        case "call":
          if (message.content.to !== user.name) return;
          handleIncomingCall({ ...message, socket: newSocket });
          break;
        case "call-received":
          handleCallReceived(message);
          break;
        case "call-accept":
          handleCallAccepted(message);
          setCallState("in-call");
          break;
        case "call-reject":
          setCallState("idle");
          toast("Call rejected");
          break;
        case "call-end":
          setCallState("ending");
          break;
        case "nego-needed":
          handleNegoNeededIncoming({ ...message, socket: newSocket });
          break;
        case "nego-final":
          handleNegoFinal(message);
          break;
      }
      // }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  useEffect(() => {
    if (peer.peer) {
      peer.peer.addEventListener("track", (ev) => {
        console.log("TRACK RECEIVED!", ev);
        setRemoteStream((prevStream) => {
          if (!prevStream) return ev.streams[0];
          return prevStream;
        });
      });
    }
  }, [peer]);

  useEffect(() => {
    if (peer.peer) {
      // Set up track handler
      peer?.onTrack((stream: MediaStream) => {
        console.log("Setting remote stream from track:", stream);
        setRemoteStream(stream);
      });

      // Set up negotiation handler
      peer.peer.onnegotiationneeded = async () => {
        try {
          const offer = await peer.getOffer();
          if (socket && caller) {
            socket.emit("message", {
              name: user.name,
              content: {
                to: caller,
                from: user.name,
                type: "nego-needed",
                offer,
              },
            });
          }
        } catch (error) {
          console.error("Negotiation error:", error);
        }
      };
    }
  }, [peer.peer, socket, caller, user?.name]);

  useEffect(() => {
    if (myStream && remoteStream && callState === "ending") {
      handleCallEnded();
    }
  }, [myStream, remoteStream, callState]);

  return {
    sendMessage,
    onlineUsers,
    socketId: socket?.id,

    callState,
    caller,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    remoteStream,
    myStream,
    isAudioEnabled,
    isVideoEnabled,
    handleToggleAudio,
    handleToggleVideo,
  };
};
