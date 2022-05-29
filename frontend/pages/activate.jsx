import React, { useRef, useState } from 'react';
import Card from '../components/shared/Layout/Card';
import Button from '../components/shared/Layout/Button';
import Loader from '../components/shared/Layout/Loader';
import { toast } from 'react-toastify';
import uploadPic from '../utils/uploadToCloudinary';
import Router from 'next/router';
import { updateAccount } from '../utils/authUtils';

const Activate = () => {
  const inputRef = useRef();
  const [name, setName] = useState();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const onImageChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      setMedia(reader.result);
    };
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    let pfpUrl;
    if (media != null) {
      pfpUrl = await uploadPic(media);
    }

    if (media != null && !pfpUrl) {
      toast.error('Something went wrong !');
      return setTimeout(() => Router.reload(), 3000);
    }

    await updateAccount(
      {
        name,
        profilePicUrl: pfpUrl || undefined,
      },
      toast,
      setLoading
    );
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
          src={media || '/user.png'}
          alt='default'
          style={{ width: '110px', height: '110px' }}
          className='text-dark rounded-full p-1 border-4 border-avatarFrame  transition-all ease-in-out duration-500 hover:border-buttonHover cursor-pointer'
          onClick={() => inputRef.current.click()}
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

export function getServerSideProps() {
  return {
    props: {
      title: 'Activate account | WhichApp',
    },
  };
}

export default Activate;
