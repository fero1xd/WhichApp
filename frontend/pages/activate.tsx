import React, { useRef, useState } from 'react';
import Card from '../components/shared/Layout/Card';
import Button from '../components/shared/Layout/Button';
import Loader from '../components/shared/Layout/Loader';
import { toast } from 'react-toastify';
import uploadPic from '../utils/uploadToCloudinary';
import Router from 'next/router';
import { updateAccount } from '../utils/authUtils';

const Activate = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>();
  const [media, setMedia] = useState<File>();
  const [mediaUrl, setMediaUrl] = useState<string>();

  const [loading, setLoading] = useState<boolean>(false);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    setMediaUrl(URL.createObjectURL(file));
    setMedia(file);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || name.length < 2) {
      return toast.error('Name should not be less than 2 characters');
    }

    setLoading(true);

    const fd = new FormData();
    fd.append('name', name);
    media && fd.append('file', media);

    await updateAccount(fd, toast, setLoading);
  };

  if (loading)
    return (
      <Card>
        <Loader />
        <h1 className='text-xl text-bold mt-5'>Please wait!</h1>
      </Card>
    );

  return (
    <Card>
      <form
        className='flex flex-col max-w-sm w-full mt-10 space-y-5 items-center'
        onSubmit={submit}
      >
        <img
          src={mediaUrl || '/user.png'}
          alt='default'
          style={{ width: '110px', height: '110px', objectFit: 'cover' }}
          className='text-dark rounded-full p-1 border-4 border-avatarFrame  transition-all ease-in-out duration-500 hover:border-buttonHover cursor-pointer '
          onClick={() => inputRef.current?.click()}
        />
        <h4 className='text-xl text-gray-200 mt-4 font-bold tracking-wider'>
          Avatar
        </h4>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          id='media'
          className='hidden'
          onChange={onImageChange}
        />
        <input
          type='text'
          maxLength={10}
          placeholder='Name'
          className='p-3 rounded-md w-full flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
          id='name'
          autoComplete='off'
          required
          onChange={(e) => setName(e.target.value)}
        />

        <Button displayIcon text='Continue' disabled={loading} />
      </form>
    </Card>
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      title: 'Activate account | WhichApp',
    },
  };
};

export default Activate;
