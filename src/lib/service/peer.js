class PeerService {
  constructor() {
    if (typeof window !== "undefined" && !this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  addStream(stream) {
    if (this.peer) {
      stream.getTracks().forEach((track) => {
        this.peer.addTrack(track, stream);
      });
    }
  }

  setRemoteDescription = async (ans, source) => {
    try {
      console.log(`Setting remote description from ${source}:`, ans);
      if (this.peer && ans) {
        // Only set remote description if we're not in stable state or it's an offer
        if (this.peer.signalingState !== "stable" || ans.type === "offer") {
          await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        } else {
          console.log("Ignoring remote description in stable state");
        }
      }
    } catch (error) {
      console.error("Error setting remote description:", error);
      throw error;
    }
  };

  getAnswer = async (offer) => {
    try {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
      }
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  };

  getOffer = async () => {
    try {
      if (this.peer) {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };

  onTrack(callback) {
    if (this.peer) {
      this.peer.ontrack = ({ streams }) => {
        console.log("Received remote stream:", streams[0]);
        callback(streams[0]);
      };
    }
  }

  toggleAudio = () => {
    try {
      // Toggle sender track
      const audioSender = this.peer
        .getSenders()
        .find((sender) => sender.track?.kind === "audio");

      if (audioSender?.track) {
        audioSender.track.enabled = !audioSender.track.enabled;
      }

      // Toggle local stream track
      const localStream = this.peer.getLocalStreams()[0];
      if (localStream) {
        const localAudioTrack = localStream.getAudioTracks()[0];
        if (localAudioTrack) {
          localAudioTrack.enabled = !localAudioTrack.enabled;
        }
      }

      return audioSender?.track?.enabled;
    } catch (error) {
      console.error("Error toggling audio:", error);
      return false;
    }
  };

  toggleVideo = () => {
    const videoTracks = this.peer
      .getSenders()
      .find((sender) => sender.track.kind === "video").track;
    videoTracks.enabled = !videoTracks.enabled;
  };
}

export default new PeerService();
