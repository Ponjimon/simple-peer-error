import React, { useEffect } from 'react';
import reset from 'styled-reset';
import dynamic from 'next/dynamic';
import styled, { createGlobalStyle } from 'styled-components';
import { SocketIOProvider, useSocket } from 'use-socketio';
import { usePeer, useRemoteStream } from '../hooks';

const Content = styled.header`
  position: relative;
  height: 100vh;
  text-align: center;
`;

const GlobalStyle = createGlobalStyle`
    ${reset};
    html {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 150%;
      line-height: 1.4;
    }
    h1 {
      font-family: 'Syncopate', sans-serif;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 3vw;
      line-height: 1.2;
      font-size: 3vw;
      text-align: center;
    span {
      display: block;
      font-size: 10vw;
      letter-spacing: -1.3vw;
    }
    html, body {
      height: 100%;
    }
    body {
      background-color: #000;
    }
}
    * {
        user-select: none
    }
`;

const Main = dynamic(() => import('../containers/Main'), { ssr: false });

const IO = () => {
  const { socket } = useSocket('connect', () => {
    console.info('IO connected.');
  });

  useEffect(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  return <>yes</>;
};

const Peer = dynamic(
  async () => {
    const { Peer: P } = await import('../components/dummy');
    return P;
  },
  { ssr: false }
);

const Home = (): JSX.Element => {
  return (
    <SocketIOProvider
      url={process.env.SERVER_URL}
      opts={{ autoConnect: false }}
    >
      <GlobalStyle />
      <Content>
        <div>URL: {process.env.SERVER_URL}</div>
        <div>
          <Main />
        </div>
      </Content>
    </SocketIOProvider>
  );
};

export default Home;
