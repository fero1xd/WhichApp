import Image from 'next/image';
import { useRef, useState } from 'react';
import Button from '../components/shared/Layout/Button';
import uploadToCloudinary from '../utils/uploadToCloudinary';
import Loader from '../components/shared/Layout/Loader';
import { toast } from 'react-toastify';
import { updateAccount } from '../utils/authUtils';
import { User } from '../utils/types';
import { NextPage } from 'next';
import React from 'react';

type ProfilePageProps = {
  user: User;
};

const Profile: NextPage<ProfilePageProps> = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [media, setMedia] = useState<File>();
  const [mediaUrl, setMediaUrl] = useState<string>();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    setMediaUrl(file ? URL.createObjectURL(file) : user.profilePicUrl);
    setMedia(file || undefined);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const dataToPost = new FormData();
    dataToPost.append('name', name);
    dataToPost.append('status', status);
    media && dataToPost.append('file', media);

    await updateAccount(dataToPost, toast, setLoading, {
      'Content-Type': 'multipart/form-data',
    });
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <div className='w-full h-[85vh] p-5 border border-border shadow-xl'>
      <div className='w-full h-full flex'>
        <div className='w-1/3 h-full flex flex-col items-center justify-center border-r-2 border-border'>
          <div className='relative cursor-pointer border-4 border-button flex items-center justify-center p-2 rounded-full shadow-xl'>
            <div className='flex items-center justify-center'>
              <Image
                onClick={() => inputRef.current?.click()}
                src={mediaUrl || user.profilePicUrl}
                height={250}
                width={250}
                priority={true}
                className='rounded-full p-3 cursor-pointer object-cover'
              />
              <input
                type='file'
                className='hidden'
                ref={inputRef}
                onChange={onImageChange}
              />
            </div>
          </div>
        </div>
        <div className='flex-1 h-full'>
          <div className='w-full h-full flex flex-col p-10 gap-20'>
            <div className='flex-1 flex flex-col gap-20'>
              <div className='space-y-4'>
                <h1 className='text-xl text-widest'>Name</h1>
                <input
                  type='text'
                  maxLength={16}
                  minLength={10}
                  placeholder='Your Name'
                  className='max-w-xl w-full p-3 rounded-md flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  id='name'
                  autoComplete='off'
                />
              </div>

              <div className='space-y-4'>
                <h1 className='text-xl text-widest'>Phone Number</h1>
                <div className='flex w-full justify-start'>
                  <input
                    type='text'
                    className='text-dark w-20 mr-3 p-3 outline-none rounded-sm font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
                    placeholder='Code'
                    id='countryCode'
                    maxLength={3}
                    min={1}
                    value={user.phoneNumber.countryCode}
                    autoComplete='off'
                    required
                    disabled
                  />

                  <input
                    type='text'
                    maxLength={16}
                    minLength={10}
                    placeholder='Phone Number'
                    className='max-w-lg w-full p-3 rounded-md flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
                    id='phoneNumber'
                    autoComplete='off'
                    value={user.phoneNumber.number}
                    required
                    disabled
                  />
                </div>
              </div>

              <div className='space-y-5'>
                <h1 className='text-xl text-widest'>Your Status</h1>
                <input
                  type='text'
                  maxLength={16}
                  minLength={10}
                  placeholder='I am having a great day!'
                  className='max-w-lg w-full p-3 rounded-md flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
                  id='status'
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  autoComplete='off'
                  required
                />
              </div>
            </div>

            <Button text='Save' onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export function getServerSideProps() {
  return {
    props: {
      title: 'Your Profile | WhichApp',
    },
  };
}

export default Profile;
