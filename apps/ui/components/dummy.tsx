import React from 'react';
import { useRemoteStream, usePeer, useWebRTC } from '../hooks';

export const Peer = () => {
  // const [
  //   remoteStreams,
  //   addRemoteStream,
  //   removeRemoteStream,
  // ] = useRemoteStream();
  // const [peer, peerId] = usePeer(addRemoteStream, removeRemoteStream);
  const peer = useWebRTC();

  return <>{peer.current ? 'peer' : 'no peer'}</>;
};
