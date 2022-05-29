import React from 'react';
import Image from 'next/image';

const Message = ({ user, message, bannerProfilePic, divRef }) => {
  const selfSender = message.sender.toString() === user._id.toString();

  return (
    <div
      ref={divRef}
      className={`${
        selfSender ? 'justify-end' : 'justify-start'
      } flex gap-3 items-end`}
    >
      {!selfSender && (
        <Image
          src={bannerProfilePic}
          height={37}
          width={37}
          priority={true}
          className='rounded-full shadow-xl'
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
              divRef.current !== null &&
                divRef.current.scrollIntoView({ behaviour: 'smooth' });
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
