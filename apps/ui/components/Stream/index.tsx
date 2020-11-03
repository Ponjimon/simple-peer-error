import React, { FC, useEffect } from 'react';

import { useStream } from '../../hooks';
import { Container } from './styles';

export interface StreamProps {
  stream: MediaStream;
  isRemote?: boolean;
}

export const Stream: FC<StreamProps> = ({ stream, isRemote }) => {
  const [setLocalStream, localVideoRef, handleCanPlayLocal] = useStream();

  useEffect(() => {
    if (stream) {
      setLocalStream(stream);
    }
  }, [stream, setLocalStream]);

  return (
    <Container>
      <video
        onContextMenu={event => event.preventDefault()}
        ref={localVideoRef}
        onCanPlay={handleCanPlayLocal}
        autoPlay
        playsInline
      />
    </Container>
  );
};
