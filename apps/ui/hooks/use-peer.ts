import Peer, { SignalData } from 'simple-peer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from 'use-socketio';
import { useLogger } from './use-logger';

export const usePeer = (
  stream?: MediaStream,
  onStream?: (stream: MediaStream) => void
) => {
  const logger = useLogger('app:hook:use-peer');
  const { socket } = useSocket();
  // const [peer, setPeer] = useState<Peer.Instance>(null);
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
    // setPeer(newPeer);
  });

  return peer;
};

export const usePeer2 = (
  initiator = true,
  stream?: MediaStream
): [Peer.Instance, SignalData, SignalData] => {
  const [peer, setPeer] = useState<Peer.Instance>(null);
  const [offer, setOffer] = useState<SignalData>(null);
  const [answer, setAnswer] = useState<SignalData>(null);

  const onSignal = useCallback(
    data => {
      if (!offer) {
        setOffer(data);
      }
      setAnswer(data);
    },
    [offer]
  );

  const onConnect = useCallback(() => {
    console.info('Peer connected.');
  }, []);

  useEffect(() => {
    if (offer) {
      return;
    }
    const peer = new Peer({ initiator, stream, trickle: false });
    peer.on('signal', onSignal).on('connect', onConnect);

    setPeer(peer);
  }, [onConnect, onSignal, offer, initiator, stream]);

  return [peer, offer, answer];
};
