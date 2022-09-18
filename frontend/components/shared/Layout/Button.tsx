import React from 'react';
import { NextPage } from 'next';

type ButtonProps = {
  displayIcon?: boolean;
  text: string;
  disabled?: boolean;
  [x: string]: any;
};

const Button: NextPage<ButtonProps> = ({
  displayIcon,
  text,
  disabled,
  ...rest
}) => {
  return (
    <button
      type='submit'
      className='relative bg-button text-white py-2.5 px-5 w-60 text-center flex items-center justify-center 
      outline-none hover:bg-buttonHover rounded-xl hover:scale-105 transition-all ease-in-out duration-700 disabled:bg-buttonHover disabled:opacity-80'
      disabled={disabled}
      style={{ marginTop: '20px' }}
      {...rest}
    >
      <span>{text}</span>
      {displayIcon && (
        <img
          src='/arrow-forward.png'
          alt='arrow'
          className='absolute right-5'
        />
      )}
    </button>
  );
};

export default Button;
