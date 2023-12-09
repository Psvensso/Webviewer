import { useCallback, useEffect, useState } from "react";

export const useWebRTC = (sharedState: {
  sendAnswer: (answer: RTCSessionDescriptionInit) => void;
  sendOffer: (offer: RTCSessionDescriptionInit) => void;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onReceiveIceCandidate: (cb: (candidate: RTCIceCandidateInit) => void) => void;
}) => {
  const { onReceiveIceCandidate, sendAnswer, sendIceCandidate, sendOffer } =
    sharedState;
  // Define the type of sharedState based on your implementation
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  // Initialize the peer connection
  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, [sendIceCandidate]);

  // Handle ICE candidates from the other peer
  useEffect(() => {
    if (peerConnection) {
      onReceiveIceCandidate((candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
    }
  }, [peerConnection, onReceiveIceCandidate]);

  // Function to start the call
  const startCall = useCallback(async () => {
    if (peerConnection) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendOffer(offer);
    }
  }, [peerConnection, sendOffer]);

  // Function to answer the call
  const answerCall = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendAnswer(answer);
      }
    },
    [peerConnection, sendAnswer]
  );

  return { localStream, remoteStream, startCall, answerCall };
};
