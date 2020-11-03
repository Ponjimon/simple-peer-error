import { useState, useCallback, useEffect } from 'react';
import { useSocket } from 'use-socketio';
import type { Socket } from 'socket.io-client';

export const useWebsocket = (): {
  socket: typeof Socket;
  connectedPeers: string[];
  messages: any[];
  sendMessage: (peerId: string, message: string) => void;
  connect: (peerId: string) => void;
  disconnect: (peerId: string) => void;
} => {
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [messages, setMessages] = useState([]);

  const getPeers = useCallback(() => ({ type: 'peers' }), []);
  const getChatMessages = useCallback(() => ({ type: 'allMessages ' }), []);

  const { socket } = useSocket('connect', () => {
    console.info('IO connected.');
    socket.send(getPeers());
    socket.send(getChatMessages());
  });

  useSocket('message', data => {
    const { type, message, allMessages, connectedPeers } = JSON.parse(data);
    switch (type) {
      case 'message':
        setMessages(messages => [...messages, message]);
        break;
      case 'allMessages':
        setMessages(allMessages);
        break;
      case 'peers':
        setConnectedPeers(connectedPeers);
        break;
      case 'updatePeers':
        socket.send(getPeers());
        break;
      default:
        console.log('Unknown message: %s', data);
    }
  });

  const cleanup = useCallback(() => {
    setConnectedPeers([]);
    setMessages([]);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    return () => {
      cleanup();
    };
  }, [socket, cleanup]);

  const sendMessage = useCallback(
    (peerId: string, message: string) => {
      socket.emit('message', {
        type: 'message',
        message: {
          peerId,
          message,
          date: Date.now(),
        },
      });
    },
    [socket]
  );

  const connect = useCallback(
    (peerId: string) => {
      socket.emit('message', {
        type: 'connect',
        message: {
          peerId,
        },
      });
    },
    [socket]
  );

  const disconnect = useCallback(
    peerId => {
      socket.send('message', {
        type: 'disconnect',
        message: {
          peerId,
        },
      });
    },
    [socket]
  );

  return { socket, connectedPeers, messages, sendMessage, connect, disconnect };
};
