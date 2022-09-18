import React from 'react';
import Image from 'next/image';
import calculateTime from '../../utils/calculateTime';
import { useRouter } from 'next/router';
import { ConnectedUser, Conversation } from '../../utils/types';
import { NextPage } from 'next';

type ChatCardProps = {
  conversation: Conversation;
  connectedUsers: ConnectedUser[];
};

const ChatCard: NextPage<ChatCardProps> = ({
  conversation,
  connectedUsers,
}) => {
  const isOnline =
    connectedUsers.length > 0 &&
    connectedUsers.filter((user) => user.userId == conversation.messagesWith)
      .length > 0;

  const router = useRouter();
  return (
    <div
      className='py-5 px-4 border-b border-border flex justify-between items-start hover:shadow-lg transition-all ease-in-out duration-500'
      onClick={() =>
        router.push(`/chat?message=${conversation.messagesWith}`, undefined, {
          shallow: true,
        })
      }
    >
      <div className='relative flex gap-3 justify-start items-start'>
        <div>
          <Image
            src={conversation.profilePicUrl}
            width={48}
            height={48}
            className='rounded-full object-cover'
            priority={true}
          />
          <span
            className={`bottom-0 left-8 top-9 absolute w-3.5 h-3.5 ${
              isOnline ? 'bg-green-400' : 'bg-gray-500'
            } border-2 border-white dark:border-gray-800 rounded-full`}
          ></span>
        </div>

        <div className='flex flex-col justify-center  overflow-x-hidden gap-1 w-36'>
          <h3 className='text-sm text-gray-200'>{conversation.name}</h3>
          <p className='truncate ... text-xs text-fade'>
            {conversation.lastMessage}
          </p>
        </div>
      </div>
      <p className='text-xs text-gray-500'>
        {calculateTime(conversation.date)}
      </p>
    </div>
  );
};

export default ChatCard;
