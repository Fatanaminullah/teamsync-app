// // import { useEffect, useState } from "react";
// // import { io, Socket } from "socket.io-client";
// // import { useAuthStore, useChatStore } from "../store";
// // import { SOCKET_URL } from "../constant";
// // import { toast } from "sonner";

// // export const useChat = (token: string | null) => {
// //   const { user } = useAuthStore();
// //   const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
// //   const [socket, setSocket] = useState<Socket | null>(null);

// //   useEffect(() => {
// //     if (!token) return;

// //     const newSocket = io(SOCKET_URL, {
// //       extraHeaders: { authorization: `Bearer ${token}` },
// //     });

// //     newSocket.on("connect", () => {
// //       console.log("Connected to WebSocket server");
// //     });

// //     newSocket.on("roomUsers", (users) => {
// //       console.log("room", users);
// //       setOnlineUsers(users);
// //     });

// //     newSocket?.on("message", (message) => {
// //       switch (message.content.type) {
// //         case "chat":
// //           console.log("incoming!", message);
// //           toast(message?.name, {
// //             description: message?.content?.content,
// //             duration: 10000,
// //           });
// //           addMessage(message);
// //           break;
// //         default:
// //           console.log("incoming!", message);
// //           toast(message?.name, {
// //             description: message?.content?.content,
// //             duration: 10000,
// //           });
// //           addMessage(message);
// //           break;
// //       }
// //     });

// //     newSocket.on("disconnect", () => {
// //       console.log("Disconnected from WebSocket server");
// //     });

// //     setSocket(newSocket);

// //     return () => {
// //       newSocket.disconnect();
// //     };
// //   }, [token]);
// //   const sendMessage = (content: string, recipient?: string) => {
// //     if (!user) return;

// //     const message = {
// //       name: user.name,
// //       content: {
// //         to: recipient!,
// //         from: user.name,
// //         content,
// //       },
// //     };

// //     socket?.emit("message", message);
// //     addMessage(message);
// //   };

// //   return { sendMessage, onlineUsers, socketId: socket?.id };
// // };

// import { useCallback, useEffect, useRef, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { useAuthStore, useChatStore } from "../store";
// import { SOCKET_URL } from "../constant";
// import { toast } from "sonner";

// const config = {
//   iceServers: [
//     {
//       urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

// type CallState = "idle" | "calling" | "receiving" | "in-call";

// export const useChat = (token: string | null) => {
//   const { user } = useAuthStore();
//   const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [callState, setCallState] = useState<CallState>("idle");
//   const [caller, setCaller] = useState<string | null>(null);
//   const [remoteOffer, setRemoteOffer] =
//     useState<RTCSessionDescriptionInit | null>(null);
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const [myStream, setMyStream] = useState<MediaStream>();
//   const [remoteStream, setRemoteStream] = useState<MediaStream>();

//   useEffect(() => {
//     if (!token) return;

//     const newSocket = io(SOCKET_URL, {
//       extraHeaders: { authorization: `Bearer ${token}` },
//     });

//     newSocket.on("connect", () => {
//       console.log("Connected to WebSocket server");
//     });

//     newSocket.on("roomUsers", (users) => {
//       console.log("room", users);
//       setOnlineUsers(users);
//     });

//     newSocket.on("message", async (message) => {
//       console.log("incoming!", message);
//       switch (message.content.type) {
//         case "chat":
//           toast(message?.name, {
//             description: message?.content?.content,
//             duration: 10000,
//           });
//           addMessage(message);
//           break;

//         case "call":
//           setCaller(message.content.from);
//           setCallState("receiving");
//           toast(`${message.name} is calling you`);
//           setRemoteOffer(message.content.offer);
//           break;

//         case "call-accept":
//           if (peerConnection.current) {
//             await peerConnection.current.setRemoteDescription(
//               message.content.answer
//             );
//             setCallState("in-call");
//           }
//           break;

//         case "call-reject":
//           setCallState("idle");
//           toast("Call rejected");
//           break;

//         case "ice-candidate":
//           if (peerConnection.current) {
//             await peerConnection.current.addIceCandidate(
//               new RTCIceCandidate(message.content.candidate)
//             );
//           }
//           break;

//         default:
//           toast(message?.name, {
//             description: message?.content?.content,
//             duration: 10000,
//           });
//           addMessage(message);
//       }
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
//       name: user.name,
//       content: {
//         to: recipient!,
//         from: user.name,
//         type: "chat",
//         content,
//       },
//     };

//     socket?.emit("message", message);
//     addMessage(message);
//   };

//   const startCall = async (recipient: string) => {
//     if (!socket || !user) return;

//     peerConnection.current = new RTCPeerConnection(config);

//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     setMyStream(stream);
//     sendStreams();
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);

//     socket.emit("message", {
//       name: user.name,
//       content: {
//         to: recipient,
//         from: user.name,
//         type: "call",
//         offer,
//       },
//     });

//     peerConnection.current.ontrack = (event) => {
//       console.log("Receiving remote track:", event.streams[0]);
//       // event.streams[0].getTracks().forEach((track) => {
//       //   remoteStream.current?.addTrack(track);
//       // });
//       setRemoteStream(event.streams[0]);
//     };

//     setCallState("calling");
//   };

//   const acceptCall = async () => {
//     if (!socket || !caller || !remoteOffer) {
//       console.error("No socket, caller, or remote offer.");
//       return;
//     }

//     peerConnection.current = new RTCPeerConnection(config);

//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     setMyStream(stream);
//     sendStreams();

//     peerConnection.current.ontrack = (event) => {
//       console.log("Receiving remote track:", event.streams[0]);
//       // event.streams[0].getTracks().forEach((track) => {
//       //   remoteStream.current?.addTrack(track);
//       // });
//       setRemoteStream(event.streams[0]);
//     };

//     try {
//       console.log("Setting remote description with received offer...");
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(remoteOffer)
//       );

//       console.log("Creating answer...");
//       const answer = await peerConnection.current.createAnswer();

//       console.log("Setting local description...");
//       await peerConnection.current.setLocalDescription(answer);

//       console.log("Sending answer to caller...");
//       socket.emit("message", {
//         name: user.name,
//         content: {
//           to: caller,
//           from: user.name,
//           type: "call-accept",
//           answer,
//         },
//       });

//       setCallState("in-call");
//     } catch (error) {
//       console.error("Error accepting call:", error);
//     }
//   };

//   const rejectCall = () => {
//     if (!socket || !caller) return;

//     socket.emit("message", {
//       name: user.name,
//       content: {
//         to: caller,
//         from: user.name,
//         type: "call-reject",
//       },
//     });

//     setCallState("idle");
//   };

//   const sendStreams = useCallback(() => {
//     if (!myStream || !peerConnection.current) return;
//     for (const track of myStream?.getTracks()) {
//       peerConnection.current.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   return {
//     sendMessage,
//     startCall,
//     acceptCall,
//     rejectCall,
//     callState,
//     caller,
//     onlineUsers,
//     myStream,
//     remoteStream,
//     socketId: socket?.id,
//   };
// };

import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore, useChatStore } from "../store";
import { SOCKET_URL } from "../constant";
import { toast } from "sonner";

const config = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

type CallState = "idle" | "calling" | "receiving" | "in-call";

export const useChat = (token: string | null) => {
  const { user } = useAuthStore();
  const { addMessage, onlineUsers, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [caller, setCaller] = useState<string | null>(null);
  const [remoteOffer, setRemoteOffer] =
    useState<RTCSessionDescriptionInit | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      extraHeaders: { authorization: `Bearer ${token}` },
    });

    newSocket.on("connect", () => console.log("Connected to WebSocket server"));
    newSocket.on("roomUsers", setOnlineUsers);

    newSocket.on("message", async (message) => {
      console.log("Incoming message:", message.content, message.content.type);

      switch (message.content.type) {
        case "chat":
          toast(message?.name, {
            description: message?.content?.content,
            duration: 10000,
          });
          addMessage(message);
          break;

        case "call":
          setCaller(message.content.from);
          setRemoteOffer(message.content.offer);
          setCallState("receiving");
          toast(`${message.name} is calling you`);
          break;

        case "call-accept":
          if (peerConnection) {
            await peerConnection.setRemoteDescription(message.content.answer);
            setCallState("in-call");
          }
          break;

        case "call-reject":
          setCallState("idle");
          toast("Call rejected");
          break;

        case "ice-candidate":
          console.log("here", peerConnection);
          if (peerConnection && message.content.candidate) {
            try {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(message.content.candidate)
              );
              console.log("Added ICE candidate");
            } catch (error) {
              console.log("Error adding received ICE candidate:", error);
            }
          }
          break;

        default:
          addMessage(message);
      }
    });

    newSocket.on("disconnect", () =>
      console.log("Disconnected from WebSocket server")
    );

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token, peerConnection]);

  const sendMessage = (content: string, recipient?: string) => {
    if (!user) return;
    const message = {
      name: user.name,
      content: { to: recipient!, from: user.name, type: "chat", content },
    };
    socket?.emit("message", message);
    addMessage(message);
  };

  const startCall = async (recipient: string) => {
    if (!socket || !user) return;

    // const pc = new RTCPeerConnection(config);
    // setPeerConnection(pc);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    stream
      .getTracks()
      .forEach((track) => peerConnection?.addTrack(track, stream));

    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);

    socket.emit("message", {
      name: user.name,
      content: { to: recipient, from: user.name, type: "call", offer },
    });

    setCallState("calling");
    if (peerConnection) {
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("message", {
            name: user.name,
            content: {
              to: recipient,
              from: user.name,
              type: "ice-candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
    }
  };

  const acceptCall = async () => {
    if (!socket || !caller || !remoteOffer || !peerConnection) return;

    // const pc = new RTCPeerConnection(config);
    // setPeerConnection(pc);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(remoteOffer)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("message", {
      name: user.name,
      content: { to: caller, from: user.name, type: "call-accept", answer },
    });

    setCallState("in-call");

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("message", {
          name: user.name,
          content: {
            to: caller,
            from: user.name,
            type: "ice-candidate",
            candidate: event.candidate,
          },
        });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  };

  const rejectCall = () => {
    if (!socket || !caller) return;
    socket.emit("message", {
      name: user.name,
      content: { to: caller, from: user.name, type: "call-reject" },
    });
    setCallState("idle");
  };

  useEffect(() => {
    const pc = new RTCPeerConnection(config);
    console.log("SET PEEER CONNECTION", pc)
    setPeerConnection(pc);
  }, []);
  console.log("PC:", peerConnection)
  return {
    sendMessage,
    startCall,
    acceptCall,
    rejectCall,
    callState,
    caller,
    onlineUsers,
    myStream,
    remoteStream,
    socketId: socket?.id,
  };
};
