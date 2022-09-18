import React, { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import PeerSocketContext from './PeerSocketContext';
import io, { Socket } from 'socket.io-client';
import { CallType, User } from '../utils/types';
import Peer from 'peerjs';

type PeerSocketProviderProps = {
  user?: User;
  children: React.ReactNode;
};
declare function require(name: string): any;

const PeerSocketProvider: FC<PeerSocketProviderProps> = ({
  user,
  children,
}) => {
  const peer = useRef<Peer>();
  const [peerId, setPeerId] = useState<string>();
  const [showCallModal, setCallModal] = useState<CallType>();

  const socket = useRef<Socket>();
  const hasCreatedPeer = useRef(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !hasCreatedPeer.current) {
      const Peer = require('peerjs').default;

      const peerInstance = new Peer() as Peer;
      hasCreatedPeer.current = true;
      peerInstance.on('open', (id: string) => {
        setPeerId(id);
      });

      peer.current = peerInstance;
    }
  }, []);

  useEffect(() => {
    // Ensuring socket and peer are both available
    if (!socket.current && peer.current) {
      socket.current = io('http://localhost:3001');

      user &&
        user.activated &&
        socket.current.emit('join', {
          userId: user._id,
        });
    }
  }, [socket.current, user, peer.current]);

  useEffect(() => {
    if (socket.current && user && user.activated) {
      socket.current.on('userBusy', (info) => {
        toast.error(`${info.recipientName} is busy`);
      });

      socket.current.on('callUserToClient', (info) => {
        setCallModal(info);
      });

      socket.current.on('alreadyOnCall', (name) => {
        toast.error(`You are already on a call with ${name}`);
      });

      socket.current.on('callerSelfBlocked', () => {
        toast.error('You have blocked this user');
      });

      socket.current.on('callerBlockedYou', () => {
        toast.error('You have been blocked by this user');
      });

      socket.current.on('cannotCallOfflineUser', (name) => {
        toast.info(`${name} is currently offline !`);
      });
    } else if (socket.current && (!user || !user.activated)) {
      console.log('Emitting off');
      socket.current.emit('off');
    }

    return () => {
      socket.current?.off('userBusy');
      socket.current?.off('callUserToClient');
      socket.current?.off('alreadyOnCall');
      socket.current?.off('callerSelfBlocked');
      socket.current?.off('callerBlockedYou');
      socket.current?.off('cannotCallOfflineUser');
    };
  }, [socket.current, user]);

  return (
    <PeerSocketContext.Provider
      value={{
        peer: peer.current,
        peerId,
        socket: socket.current,
        showCallModal,
        setCallModal,
      }}
    >
      {children}
    </PeerSocketContext.Provider>
  );
};

export default PeerSocketProvider;
