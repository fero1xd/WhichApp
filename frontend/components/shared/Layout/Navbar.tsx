import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { logoutUser } from '../../../utils/authUtils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { User } from '../../../utils/types';
import { NextPage } from 'next';

type NavbarProps = {
  user: User;
};

const Navbar: NextPage<NavbarProps> = ({ user }) => {
  const logout = async () => {
    await logoutUser(toast);
  };

  const router = useRouter();

  const activePage = router.pathname;
  return (
    <>
      <div className='flex justify-between px-40 py-5 bg-card shadow-lg sticky top-0 z-50'>
        <div className='flex items-center justify-center gap-5'>
          <img src='/favicon.png' alt='logo' className='h-10' />
          <h1 className='text-md text-white font-bold tracking-wider'>
            WhichApp
          </h1>
        </div>

        <div className='flex items-center justify-center gap-5'>
          <div className='flex gap-6 items-center justify-between uppercase mr-10'>
            <Link href='/chat'>
              <div
                className={`${
                  activePage === '/chat' &&
                  'border border-b-2 border-l-0 border-r-0 border-t-0 rounded-sm font-roboto'
                } p-2  cursor-pointer`}
              >
                <h1
                  className={`opacity-50 ${
                    activePage === '/chat' && 'opacity-100'
                  }`}
                >
                  Chat
                </h1>
              </div>
            </Link>
            <Link href='/contacts' className='cursor-pointer'>
              <div className='p-2'>
                <div
                  className={`${
                    activePage === '/contacts' &&
                    'border border-b-2 border-l-0 border-r-0 border-t-0 rounded-sm font-roboto'
                  } p-2  cursor-pointer`}
                >
                  <h1
                    className={`opacity-50  cursor-pointer ${
                      activePage === '/contacts' && 'opacity-100'
                    }`}
                  >
                    Contacts
                  </h1>
                </div>
              </div>
            </Link>
          </div>
          <div className='flex items-center justify-between gap-5'>
            <div className='cursor-pointer flex items-center justify-center p-0.5 border-2 border-button rounded-full'>
              <Link href='/profile'>
                <Image
                  src={user.profilePicUrl}
                  alt={user.name}
                  priority={true}
                  width={40}
                  height={40}
                  className='rounded-full object-cover'
                />
              </Link>
            </div>
            <FaSignOutAlt
              size={23}
              onClick={logout}
              className='cursor-pointer'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
