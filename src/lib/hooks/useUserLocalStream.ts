import { useEffect, useState } from "react";

export const useUserLocalStream = (): MediaStream | null => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing user media:", error);
      }
    };

    getUserMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return localStream;
};
