import React, {
  FC,
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSocket } from 'use-socketio';
import Peer, { SignalData } from 'simple-peer';
import { Logger } from '@elo-video-chat/utils';
import {
  useUserMedia,
  usePeer,
  useStream,
  useLogger,
  useCombinedRefs,
} from '../../hooks';
import { Container } from '../Stream/styles';
import { Stream } from '../Stream';

interface SocketPeer {
  peerId: string;
  peer?: Peer.Instance;
  offer?: SignalData;
}

const Video = forwardRef<Peer.Instance>((p, ref) => {
  const innerRef = useRef<Peer.Instance>(null);
  const peer = useCombinedRefs<Peer.Instance>(ref, innerRef);
  const logger = useLogger('app:component:Video');
  const [setLocalStream, localVideoRef, handleCanPlayLocal] = useStream();
  useEffect(() => {
    if (!peer.current) {
      return;
    }
    logger.log('wuggi');
    peer.current.on('stream', stream => {
      logger.log('Receiving stream');
      setLocalStream(stream);
    });
  }, [setLocalStream, logger, peer, ref]);

  return (
    <video
      onContextMenu={event => event.preventDefault()}
      ref={localVideoRef}
      onCanPlay={handleCanPlayLocal}
      autoPlay
      playsInline
    />
  );
});

Video.displayName = 'Video';

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

  console.log('peer', peer);

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
