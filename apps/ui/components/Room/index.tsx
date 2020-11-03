import React, { FC, useEffect, useState } from 'react';
import { useSocket } from 'use-socketio';
import { useUserMedia, usePeer, useLogger } from '../../hooks';
import { Container } from '../Stream/styles';
import { Stream } from '../Stream';

export const Room: FC = () => {
  const logger = useLogger('app:component:Room');
  const { socket } = useSocket();
  const localStream = useUserMedia();
  const [remoteStream, setRemoteStream] = useState<MediaStream>(null);
  const peer = usePeer(localStream, setRemoteStream);
  const [isConnected, setIsConnected] = useState(false);

  useSocket('connect', () => {
    setIsConnected(true);
    logger.log('Connected.');
  });

  useSocket('close', () => {
    setIsConnected(false);
    logger.log('Disconnected.');
  });

  useEffect(() => {
    if (isConnected) {
      socket.emit('join');
    }
  }, [isConnected, socket]);

  return (
    <>
      <div>{isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>{peer.current ? 'Peer' : 'No Peer'}</div>
      <div>
        Local
        <Container>
          <Stream stream={localStream} />
        </Container>
      </div>
      <div>
        Remote
        <Container>
          <Stream stream={remoteStream} />
        </Container>
      </div>
    </>
  );
};
