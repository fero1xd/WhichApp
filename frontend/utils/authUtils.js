import axios from 'axios';
import catchErrors from './catchErrors';
import baseUrl from './baseUrl';
import Router from 'next/router';

export const requestOtp = async (phoneData, toast, setLoading) => {
  try {
    setLoading(true);
    const { data } = await axios.post(`${baseUrl}/auth/otp`, phoneData, {
      withCredentials: true,
    });

    if (data.status) {
      setLoading(false);
      return data;
    }

    throw new Error('Something went wrong!');
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e));
  }
};

export const verifyOtp = async (dataToPost, toast, setLoading) => {
  try {
    setLoading(true);
    const { data } = await axios.post(`${baseUrl}/auth/verify`, dataToPost, {
      withCredentials: true,
    });

    if (data.status) {
      if (data.auth) {
        // window.location.href = "/";
        Router.push('/');
      } else {
        Router.push('/activate');
      }
    }
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e));
  }
};

export const updateAccount = async (dataToPost, toast, setLoading) => {
  try {
    setLoading(true);
    const { data } = await axios.put(`${baseUrl}/auth/`, dataToPost, {
      withCredentials: true,
    });

    if (data.status) {
      Router.push('/');
      // window.location.href = "/";
    }
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e));
  }
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
};

export const logoutUser = async (toast) => {
  try {
    const { data } = await axios.get(`${baseUrl}/auth/logout`, {
      withCredentials: true,
    });

    if (data.status) {
      Router.push('/authenticate');
    }
  } catch (e) {
    toast.error(catchErrors(e));
    Router.push('/authenticate');
  }
};
