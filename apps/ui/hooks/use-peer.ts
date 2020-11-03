import Peer from 'simple-peer';
import { useCallback, useRef } from 'react';
import { useSocket } from 'use-socketio';
import { useLogger } from './use-logger';

export const usePeer = (
  stream?: MediaStream,
  onStream?: (stream: MediaStream) => void
) => {
  const logger = useLogger('app:hook:use-peer');
  const { socket } = useSocket();
  const peer = useRef<Peer.Instance>(null);

  const onSignal = useCallback(
    (offer, pairedPeerId) => {
      logger.log('Sending signal');
      socket.emit('signal', { offer, pairedPeerId });
    },
    [socket, logger]
  );

  useSocket('pair', ({ initiator, peerId, offer }) => {
    logger.log(
      'Pair',
      'Initiator:',
      initiator,
      'Paired PeerId:',
      peerId,
      'Offer:',
      offer?.type
    );
    const options: Peer.Options = initiator
      ? { initiator, stream, trickle: false }
      : { initiator: false, trickle: false };

    peer.current = peer.current ?? new Peer(options);
    peer.current
      .on('signal', offer => onSignal(offer, peerId))
      .on('stream', stream => {
        logger.log('Stream');
        if (onStream) {
          onStream(stream);
        }
      })
      .on('close', () => {
        logger.log('Peer closed.');
        socket.disconnect();
      });

    if (offer) {
      peer.current.signal(offer);
    }
  });

  return peer;
};
