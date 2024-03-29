import Message from './Message';
import TopBar from './TopBar';
import BottomField from './BottomField';
import {
  BannerData,
  Conversation,
  Message as MessageType,
  User,
} from '../../utils/types';
import { NextPage } from 'next';
import {
  RefObject,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';

type ChatScreenProps = {
  user: User;
  bannerData: BannerData;
  messages: MessageType[];
  sendMessage: (message: string, imageUrl?: string) => void;
  divRef: RefObject<HTMLDivElement>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  emitBlockUser: () => void;
  emitUnblockUser: () => void;
  deleteConvo: (messagesWith: string) => void;
  callUser: (userToCall: string) => void;
  sendTypingStatus: () => void;
  isRecipientTyping: boolean;
  conversations: Conversation[];
};

const ChatScreen: NextPage<ChatScreenProps> = ({
  user,
  bannerData,
  messages,
  sendMessage,
  divRef,
  setLoading,
  emitBlockUser,
  emitUnblockUser,
  deleteConvo,
  callUser,
  sendTypingStatus,
  isRecipientTyping,
  conversations,
}) => {
  const [text, setText] = useState('');

  const isYellow = text.length > 50 && text.length < 100;
  const isRed = text.length >= 100;

  return (
    <div className='w-full h-full flex flex-col items-center justify-between'>
      <TopBar
        conversations={conversations}
        callUser={callUser}
        deleteConvo={deleteConvo}
        bannerData={bannerData}
        setLoading={setLoading}
        emitBlockUser={emitBlockUser}
        isRecipientTyping={isRecipientTyping}
      />

      <div className='chat flex-1 w-full overflow-x-hidden text-white flex flex-col px-11 py-10 gap-8'>
        {messages.map((message, i) => (
          <Message
            user={user}
            message={message}
            key={i}
            bannerProfilePic={bannerData.profilePicUrl}
            divRef={divRef}
          />
        ))}
      </div>

      <BottomField
        sendTypingStatus={sendTypingStatus}
        bannerData={bannerData}
        text={text}
        sendMessage={sendMessage}
        setText={setText}
        setLoading={setLoading}
        isRed={isRed}
        isYellow={isYellow}
        emitBlockUser={emitBlockUser}
        emitUnblockUser={emitUnblockUser}
      />
    </div>
  );
};

export default ChatScreen;
