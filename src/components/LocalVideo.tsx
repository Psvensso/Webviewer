import { useEffect, useRef } from "react";
import { useAppContext } from "../useApp";

export const LocalVideo = () => {
  const { localStream } = useAppContext();
  const userVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <>
      {localStream && (
        <video
          id="localVideo"
          autoPlay
          playsInline
          ref={userVideoRef}
          muted // Mute the local video to avoid feedback
          style={{
            position: "absolute",
            top: 0,
            width: "50px",
            height: "50px",
          }} // Adjust dimensions as needed
        />
      )}
    </>
  );
};
