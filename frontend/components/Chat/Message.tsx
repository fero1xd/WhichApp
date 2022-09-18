import React from 'react';
import Image from 'next/image';
import { Message as MessageType, User } from '../../utils/types';
import { NextPage } from 'next';
import { RefObject } from 'react';
import { useState } from 'react';
import replaceExt from 'replace-ext';

type MessageProps = {
  user: User;
  message: MessageType;
  bannerProfilePic: string;
  divRef: RefObject<HTMLDivElement>;
};

const Message: NextPage<MessageProps> = ({
  user,
  message,
  bannerProfilePic,
  divRef,
}) => {
  const selfSender = message.sender.toString() === user._id.toString();
  const [finalImage, setFinalImage] = useState(
    replaceExt(bannerProfilePic, '.png')
  );

  return (
    <div
      ref={divRef}
      className={`${
        selfSender ? 'justify-end' : 'justify-start'
      } flex gap-3 items-end`}
    >
      {!selfSender && (
        <Image
          src={finalImage}
          onMouseEnter={() => {
            if (
              bannerProfilePic.endsWith('.gif') &&
              finalImage.endsWith('.png')
            ) {
              setFinalImage(bannerProfilePic);
            }
          }}
          onMouseLeave={() => {
            if (
              bannerProfilePic.endsWith('.gif') &&
              finalImage.endsWith('.gif')
            ) {
              setFinalImage(replaceExt(bannerProfilePic, '.png'));
            }
          }}
          height={37}
          width={37}
          priority={true}
          className='rounded-full shadow-xl object-cover'
        />
      )}
      <div
        className={`max-w-md text-sm text-light px-5 py-4 rounded-3xl border border-border shadow-lg overflow-hidden flex ${
          !message.image ? 'items-center' : 'items-end'
        } ${message.message && 'gap-2'} justify-center flex-col`}
      >
        {message.image && (
          <img
            src={message.image}
            className='rounded-md'
            onLoad={() => {
              divRef.current &&
                divRef.current.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
        <p className='max-w-md text-light font-roboto break-all'>
          {message.message}
        </p>
      </div>
    </div>
  );
};

export default Message;
