import { useEffect, useState } from 'react';
import { USER_MEDIA_CONFIG } from '../constants';

export const useUserMedia = () => {
  const [mediaStream, setMediaStream] = useState<MediaStream>(null);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          USER_MEDIA_CONFIG
        );
        setMediaStream(stream);
      } catch (e) {
        console.error(e);
      }
    };

    if (!mediaStream) {
      enableStream();
      return;
    }

    return () => {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    };
  }, [mediaStream]);

  return mediaStream;
};
