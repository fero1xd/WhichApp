import HeadTags from '../components/shared/Layout/HeadTags';
import Layout from '../components/shared/Layout/Layout';

import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

import { parseCookies, destroyCookie } from 'nookies';
import { redirectUser } from '../utils/authUtils';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import PeerProvider from '../context/PeerProvider';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <PeerProvider {...pageProps}>
        <Layout {...pageProps}>
          <ToastContainer toastStyle={{ backgroundColor: 'crimson' }} />
          <HeadTags title={pageProps.title} />
          <Component {...pageProps} />
        </Layout>
      </PeerProvider>
    </>
  );
}

MyApp.getInitialProps = async ({ ctx }) => {
  const { token } = parseCookies(ctx);
  let pageProps = {};

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
      const {
        data: { user },
      } = await axios.get(`${baseUrl}/auth`, {
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
