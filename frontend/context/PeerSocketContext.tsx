import Peer from 'peerjs';
import { createContext } from 'react';
import { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { Socket } from 'socket.io-client';
import { CallType } from '../utils/types';

type PeerSocketContextType = {
  peer?: Peer;
  peerId?: string;
  socket?: Socket;
  showCallModal?: CallType;
  setCallModal?: Dispatch<SetStateAction<CallType | undefined>>;
};

const PeerSocketContext = createContext<PeerSocketContextType>({});
export default PeerSocketContext;
