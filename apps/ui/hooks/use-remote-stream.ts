import { useState, useCallback } from 'react';

export const useRemoteStream = (): [
  MediaStream[],
  (stream: MediaStream, peerId: string) => void,
  (peerId: string) => void
] => {
  const [remoteStreams, setRemoteStreams] = useState([]);

  const addRemoteStream = useCallback((stream: MediaStream, peerId: string) => {
    setRemoteStreams(remoteStreams => {
      if (!stream || !peerId) {
        return [...remoteStreams];
      }

      if (remoteStreams.some(remoteStream => remoteStream.peerId === peerId)) {
        return [...remoteStreams];
      }
    });
  }, []);

  const removeRemoteStream = useCallback((peerId: string) => {
    setRemoteStreams(remoteStreams => {
      const index = remoteStreams.findIndex(
        remoteStream => remoteStream.peerId === peerId
      );
      if (index < 0) {
        return [...remoteStreams];
      }

      remoteStreams.splice(index, 1);

      return [...remoteStreams];
    });
  }, []);

  return [remoteStreams, addRemoteStream, removeRemoteStream];
};
