import { NextPage } from 'next';
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  [x: string]: any;
};

const Card: NextPage<CardProps> = ({ children, ...rest }) => {
  return (
    <div
      {...rest}
      className='flex flex-col max-w-2xl w-full items-center justify-center p-24  border-card border rounded-lg shadow-lg hover:shadow-2xl transition-all ease-in-out duration-700'
    >
      {children}
    </div>
  );
};

export default Card;
