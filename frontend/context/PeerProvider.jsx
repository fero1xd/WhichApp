import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import PeerContext from './PeerContext';

const PeerProvider = ({ user, children }) => {
  const peer = useRef();
  const [peerId, setPeerId] = useState();
  const [showCallModal, setCallModal] = useState(false);

  const socket = useRef();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const Peer = require('peerjs').default;

      const peerInstance = new Peer();
      peerInstance.on('open', (id) => {
        setPeerId(id);
      });

      peer.current = peerInstance;
    }
  }, []);

  // call effect
  useEffect(() => {
    if (socket.current) {
      socket.current.off('callUserToClient').on('callUserToClient', (info) => {
        console.log(info);
        setCallModal(info);
      });

      socket.current.off('userBusy').on('userBusy', (info) => {
        toast.error(`${info.recipientName} is busy`);
      });

      socket.current.off('cannotCallSameUser').on('cannotCallSameUser', () => {
        toast.error('Cannot call same user');
      });

      socket.current.off('alreadyOnCall').on('alreadyOnCall', () => {
        toast.error('You are already on a call');
      });
    }
  }, []);

  return (
    <PeerContext.Provider
      value={{ peer, peerId, socket, showCallModal, setCallModal }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
