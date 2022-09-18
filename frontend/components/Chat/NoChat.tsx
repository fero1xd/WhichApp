import React from 'react';

const NoChat = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center gap-10'>
      <img src='/not_found.svg' alt='No Chat' className='w-1/3 h-1/3' />
      <h1 className='text-xl text-white mt-4 font-bold tracking-wider'>
        Welcome to the Chat Area!
      </h1>
    </div>
  );
};

export default NoChat;
