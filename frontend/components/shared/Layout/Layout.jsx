import React, { useContext, useEffect, useRef, useState } from 'react';
import Router from 'next/router';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import Navbar from './Navbar';
import PeerContext from '../../../context/PeerContext';
import CallModal from '../../Modal/CallModal';

const Layout = ({ children, user }) => {
  Router.events.on('routeChangeStart', () => nprogress.start());
  Router.events.on('routeChangeComplete', () => nprogress.done());
  Router.events.on('routeChangeError', () => nprogress.done());

  const { showCallModal } = useContext(PeerContext);

  return (
    <>
      <div className='h-screen bg-dark text-white'>
        <div className='h-full flex flex-col'>
          {user && user.activated && <Navbar user={user} />}

          {!user || !user.activated ? (
            <div className='flex-1 bg-dark font-poppins flex flex-col'>
              <div className='container mx-auto flex items-center justify-center flex-1'>
                {children}
              </div>
            </div>
          ) : (
            user &&
            user.activated && (
              <div className='flex-1 bg-dark font-poppins flex flex-col'>
                <div className='container mx-auto flex items-center justify-center flex-1'>
                  {showCallModal && <CallModal user={user} />}
                  {children}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Layout;
