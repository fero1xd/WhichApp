import React, { useContext, useEffect } from 'react';
import io from 'socket.io-client';
import PeerContext from '../../../context/PeerContext';
import newMsgSound from '../../../utils/newMsgSound';

const Socket = ({ user, children }) => {
  const { socket } = useContext(PeerContext);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io('http://localhost:3001');
    }

    if (socket.current) {
      socket.current.emit('join', {
        userId: user._id,
      });

      socket.current.off('newMessageReceived').on('newMessageReceived', () => {
        newMsgSound();
      });

      socket.current.off('callUserToClient').on('callUserToClient', (info) => {
        console.log(info);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.emit('off');
        socket.current.off();
      }
    };
  }, []);

  return <>{children}</>;
};

export default Socket;
