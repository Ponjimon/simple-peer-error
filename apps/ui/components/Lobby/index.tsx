import React, { FC } from 'react';
import { Stream } from '../Stream';

export interface LobbyProps {
  stream: MediaStream;
  peersOnlineCount: number;
  peerId: string;
  onJoin: () => void;
  onConnect: () => void;
}
export const Lobby: FC<LobbyProps> = ({
  stream,
  peersOnlineCount,
  peerId,
  onJoin,
  onConnect,
}) => (
  <>
    <div>PeerID: {peerId}</div>
    <div>
      <Stream stream={stream} />
    </div>
    <div>{peersOnlineCount} online</div>
    <div>
      <button onClick={onConnect}>Connect</button>
      <button onClick={onJoin}>Join</button>
    </div>
  </>
);
