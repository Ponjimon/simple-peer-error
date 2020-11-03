import { useRef, useCallback, MutableRefObject } from 'react';

export const useStream = (): [
  (stream: MediaStream) => void,
  MutableRefObject<HTMLVideoElement>,
  () => void
] => {
  const videoRef = useRef<HTMLVideoElement>();

  const setStream = useCallback(
    stream => {
      if (stream && !videoRef?.current.srcObject) {
        videoRef.current.srcObject = stream;
      }
    },
    [videoRef]
  );

  const handleCanPlay = useCallback(() => {
    videoRef?.current.play();
  }, [videoRef]);

  return [setStream, videoRef, handleCanPlay];
};
