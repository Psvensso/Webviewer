import { useEffect, useRef } from "react";
import { useAppContext } from "../useApp";

export const RemoteVideo = () => {
  const { remoteStream } = useAppContext();
  const userVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = remoteStream;
      console.log("setting remote stream to video", remoteStream);
    }
  }, [remoteStream]);

  return (
    <>
      {remoteStream && (
        <>
          <video
            id="localVideo"
            autoPlay
            playsInline
            ref={userVideoRef}
            muted // Mute the local video to avoid feedback
            style={{ width: "100%", height: "auto" }} // Adjust dimensions as needed
          />
        </>
      )}
    </>
  );
};
