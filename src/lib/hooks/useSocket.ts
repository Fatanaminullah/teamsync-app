import { useCallback, useEffect, useState } from "react";
import { Message, useAuthStore, useChatStore } from "../store";
import { io, Socket } from "socket.io-client";
import peer from "@/lib/service/peer";
import { SOCKET_URL } from "../constant";
import { toast } from "sonner";

type CallState = "idle" | "calling" | "receiving" | "in-call";

export const useSocket = (token: string | null) => {
  const { user } = useAuthStore();
  const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [callState, setCallState] = useState<CallState>("idle");
  const [caller, setCaller] = useState<string | null>(null);
  const [isAudioMute, setIsAudioMute] = useState(false);
  const [isVideoOnHold, setIsVideoOnHold] = useState(false);
  const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit>();

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
    setIsAudioMute(!isAudioMute);
  };

  const handleToggleVideo = () => {
    peer.toggleVideo();
    setIsVideoOnHold(!isVideoOnHold);
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

  const endCall = useCallback(() => {
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
    setCallState("idle");
    
  }, [myStream, socket]);

  const handleIncomingCall = async ({
    content,
    socket,
  }: Message & { socket: Socket }) => {
    const { offer, from } = content;
    setCaller(from);
    setCallState("receiving");
    setRemoteOffer(offer);
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
    ({ content: { from, ans } }: Message) => {
      peer.setRemoteDescription(ans, "handleCallReceived");
      console.log("Call Accepted by Caller!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleCallEnded = useCallback(
    ({ content }: Message) => {
      if (content.from === user.name) {
        peer?.peer?.close();

        if (myStream) {
          myStream.getTracks().forEach((track) => track.stop());
          setMyStream(undefined);
        }

        setRemoteStream(undefined);
      }
      setCallState("idle");
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    try {
      console.log("NEGO NEEDED", socket);
      const offer = await peer.getOffer();
      if (!socket || !caller) {
        console.warn("Socket or caller not available for negotiation");
        return;
      }
      socket.emit("message", {
        name: user.name,
        content: {
          to: caller,
          from: user.name,
          type: "nego-needed",
          offer,
        },
      });
    } catch (error) {
      console.error("Negotiation error:", error);
    }
  }, [socket, caller, user?.name]);

  const handleNegoNeededIncoming = useCallback(
    async ({ content, socket }: Message & { socket: Socket }) => {
      const { offer, from } = content;
      console.log("NEGO INCOMING", offer);
      const ans = await peer.getAnswer(offer);
      console.log("GOT ANSWER AFTER NEGO?", ans);
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
    console.log("NEGO DONE", ans);
    await peer.setRemoteDescription(ans, "handleNegoFinal");
  }, []);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    newSocket.on("roomUsers", (users) => {
      setOnlineUsers(users);
    });
    newSocket.on("message", async (message: Message) => {
      console.log("incoming!", message.content);
      console.log("type!", message.content.type);
      switch (message.content.type) {
        case "chat":
          toast(message?.name, {
            description: message?.content?.content,
            duration: 5000,
            closeButton: true,
          });
          addMessage(message);
          break;
        case "call":
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
          handleCallEnded(message);
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
  }, [token]);

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

  // useEffect(() => {
  //   if (peer.peer) {
  //     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

  //     return () => {
  //       peer?.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
  //     };
  //   }
  // }, [handleNegoNeeded, peer]);

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
  };
};
