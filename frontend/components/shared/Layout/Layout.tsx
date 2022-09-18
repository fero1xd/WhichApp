import React, { useContext, ReactNode } from 'react';
import Router from 'next/router';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import Navbar from './Navbar';
import PeerSocketContext from '../../../context/PeerSocketContext';
// import CallModal  '../../Modal/CallModal';
import { User } from '../../../utils/types';
import { NextPage } from 'next';
import CallModal from '../../Modal/CallModal';

type LayoutProps = {
  children: ReactNode;
  user?: User;
};

const Layout: NextPage<LayoutProps> = ({ children, user }) => {
  Router.events.on('routeChangeStart', () => nprogress.start());
  Router.events.on('routeChangeComplete', () => nprogress.done());
  Router.events.on('routeChangeError', () => nprogress.done());

  const { showCallModal } = useContext(PeerSocketContext);

  return (
    <>
      <div className='h-screen bg-dark text-white overflow-hidden'>
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
