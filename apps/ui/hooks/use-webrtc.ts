import {
  useRef,
  useEffect,
  useCallback,
  useState,
  MutableRefObject,
} from 'react';
import Peer from 'simple-peer';
import { useSocket } from 'use-socketio';

export interface Signature {
  type: string;
  sdp: string;
}

export const useWebRTC = (
  initiator = true
): [MutableRefObject<Peer.Instance>, string, Signature] => {
  const peer = useRef<ReturnType<typeof Peer>>(
    new Peer({ initiator, trickle: false })
  );
  const [peerId, setPeerId] = useState('');
  const [offer, setOffer] = useState(null);
  const { socket } = useSocket('peerId', peerId => {
    setPeerId(peerId);
  });

  const onSignal = useCallback(data => {
    setOffer(data);
  }, []);

  const onConnect = useCallback(() => {
    console.info('Peer connected.');
  }, []);

  useEffect(() => {
    const p = peer.current;
    p.on('signal', onSignal).on('connect', onConnect);

    return () => {
      p.destroy();
    };
  }, [onConnect, onSignal, socket]);

  return [peer, peerId, offer];
};
