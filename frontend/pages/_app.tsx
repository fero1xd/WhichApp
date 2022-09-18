import HeadTags from '../components/shared/Layout/HeadTags';
import Layout from '../components/shared/Layout/Layout';

import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

import { parseCookies, destroyCookie } from 'nookies';
import { redirectUser } from '../utils/authUtils';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import PeerSocketProvider from '../context/PeerSocketProvider';
import { User } from '../utils/types';
import { AppProps } from 'next/app';
import { NextPageContext } from 'next';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <PeerSocketProvider {...pageProps}>
        <Layout {...pageProps}>
          <ToastContainer toastStyle={{ backgroundColor: '#131313' }} />
          <HeadTags />
          <Component {...pageProps} />
        </Layout>
      </PeerSocketProvider>
    </>
  );
};

MyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
  const { token } = parseCookies(ctx);
  let pageProps: { user?: User } = {};

  const protectedRoutes =
    ctx.pathname === '/chat' ||
    ctx.pathname === '/profile' ||
    ctx.pathname === '/contacts' ||
    ctx.pathname === '/contacts/add';
  const semiProtectedRoutes = ctx.pathname === '/activate'; // not activated members can only access these routes
  const guestRoutes = ctx.pathname === '/authenticate';

  if (!token) {
    destroyCookie(ctx, 'token');
    !guestRoutes && redirectUser(ctx, '/authenticate');
  } else {
    try {
      const { data: user } = await axios.get<User>(`${baseUrl}/auth`, {
        withCredentials: true,
        headers: {
          Cookie: `token=${token}`,
        },
      });

      if (!user) {
        throw new Error();
      }

      if (!user.activated && !semiProtectedRoutes) {
        redirectUser(ctx, '/activate');
      } else if (user.activated && !protectedRoutes) {
        redirectUser(ctx, '/chat');
      }

      pageProps.user = user;
    } catch (e) {
      destroyCookie(ctx, 'token');
      redirectUser(ctx, '/authenticate');
    }
  }

  return { pageProps };
};

export default MyApp;
