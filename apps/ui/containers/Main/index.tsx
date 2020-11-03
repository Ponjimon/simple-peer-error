import { Button } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useSocket } from 'use-socketio';
import { Room } from '../../components';

export const Main = () => {
  const { socket } = useSocket();
  const [clicked, setClicked] = useState(0);
  const onConnect = useCallback(() => {
    if (!socket.connected) {
      setClicked(clicked + 1);
      socket.connect();
    }
  }, [socket, clicked]);

  return (
    <>
      <Button variant="contained" onClick={onConnect}>
        Connect {clicked}
      </Button>
      <Room />
    </>
  );
};

export default Main;
