import React, { useState } from 'react';
import Message from './Message';
import TopBar from './TopBar';
import BottomField from './BottomField';

const ChatScreen = ({
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
}) => {
  const [text, setText] = useState('');

  const isYellow = text.length > 50 && text.length < 100;
  const isRed = text.length >= 100;

  return (
    <div className='w-full h-full flex flex-col items-center justify-between'>
      <TopBar
        callUser={callUser}
        deleteConvo={deleteConvo}
        bannerData={bannerData}
        setLoading={setLoading}
        emitBlockUser={emitBlockUser}
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
