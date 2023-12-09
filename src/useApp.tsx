import { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParam } from "react-use";
import { supabase } from "./lib/supabaseClient";
import { createContext } from "./utils/createContext";

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}
const __defaultUserId = randomId();
export type Offer = {
  sdp: string | undefined;
  type: RTCSdpType;
};
export type Connection = {
  offer: Offer;
  iceCandidate: RTCIceCandidateInit;
};

export const _useApp = (p: { channelId: string } = { channelId: "lobby" }) => {
  const { channelId } = p;
  const userIdParams = useSearchParam("userId");
  const userId = useMemo(() => userIdParams || __defaultUserId, [userIdParams]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [iceCandidatesQueue, setIceCandidatesQueue] = useState<
    RTCIceCandidate[]
  >([]);
  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidate) => {
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate);
      } else {
        setIceCandidatesQueue((prevQueue) => [...prevQueue, candidate]);
      }
    },
    [peerConnection]
  );

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
        channelRef?.current?.send({
          type: "broadcast",
          event: "newIce",
          payload: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Got remote track:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    setPeerConnection(pc);

    return () => {
      pc.close();
    };
  }, []);

  // Function to start the call
  const startCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      peerConnection?.addTrack(track, stream);
    });
    const offer = await peerConnection?.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      iceRestart: true,
    });
    await peerConnection?.setLocalDescription(offer);
    return offer;
  }, [peerConnection]);

  // Function to answer the call
  const answerCall = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      stream.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, stream);
      });

      await peerConnection?.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection?.createAnswer();
      await peerConnection?.setLocalDescription(answer);
      return answer;
    },
    [peerConnection]
  );

  useEffect(() => {
    const channel = supabase
      .channel(channelId, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on("broadcast", { event: "joinRoom" }, console.log)
      // Handle ICE candidates from the other peer
      .on("broadcast", { event: "newIce" }, (e) => {
        console.log("Recieved new ICE candidate");
        e.payload && addIceCandidate(new RTCIceCandidate(e.payload));
      })
      .on("broadcast", { event: "refresh" }, () => {
        window.location.reload();
      })
      .on("broadcast", { event: "answer" }, async (e) => {
        console.log("recieved answer");
        if (e.payload) {
          console.log("setting remote description");
          peerConnection?.setRemoteDescription(
            new RTCSessionDescription(e.payload)
          );

          try {
            for (const candidate of iceCandidatesQueue) {
              if (peerConnection) {
                await peerConnection.addIceCandidate(candidate);
              }
            }
            setIceCandidatesQueue([]);
          } catch (error) {
            console.error("Error adding queued ICE candidates:", error);
          }
        }
      })
      .on("broadcast", { event: "call_me" }, async (e) => {
        console.log("new call recieved", e);
        if (e.payload) {
          const callOffer = await startCall();
          channelRef.current?.send({
            type: "broadcast",
            event: "call",
            payload: callOffer,
          });
        }
      })
      .on("broadcast", { event: "call" }, async (e) => {
        console.log("new call recieved", e);
        if (e.payload) {
          const answer = await answerCall(e.payload);
          console.log("sending answer");
          channelRef.current?.send({
            type: "broadcast",
            event: "answer",
            payload: answer,
          });
        }
      });

    if (channel.state === "closed") {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setTimeout(() => {
            channel?.send({
              type: "broadcast",
              event: "joinRoom",
              payload: { userId },
            });
          }, 1000);
          channelRef.current = channel;

          window.onbeforeunload = () => {
            channel?.send({
              type: "broadcast",
              event: "leave",
              payload: { userId },
            });
            return null;
          };
        }
      });
    }

    return () => {
      channel?.unsubscribe();
    };
  }, [
    channelId,
    userId,
    answerCall,
    peerConnection,
    addIceCandidate,
    startCall,
    iceCandidatesQueue,
  ]);

  useEffect(() => {
    channelRef.current?.track({ userId });
  }, [channelRef, userId]);

  return {
    remoteStream,
    startCall,
    answerCall,
    localStream,
    userId,
    channelRef,
  };
};

export type TAppContext = ReturnType<typeof _useApp>;
export const [AppProvider, useAppContext] = createContext<TAppContext>({
  name: "AppContext",
  errorMessage:
    "useAppContext: `context` is undefined. Seems you forgot to wrap the panel parts in `<AppProvider />` ",
});
