import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import catchErrors from './catchErrors';
import baseUrl from './baseUrl';
import Router from 'next/router';
import { Context } from './interfaces';
import { Dispatch, SetStateAction } from 'react';
import {
  PhoneNumber,
  RequestOtpResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from './types';

const defaultConfig: AxiosRequestConfig = { withCredentials: true };

const Axios = axios.create({
  baseURL: baseUrl,
  ...defaultConfig,
});

export const requestOtp = async (
  phoneData: PhoneNumber,
  toast: any,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setLoading(true);
    const { data } = await Axios.post<RequestOtpResponse>(
      `${baseUrl}/auth/otp`,
      phoneData
    );

    if (data.status === 'success') {
      setLoading(false);
      return data;
    }

    throw new Error('Something went wrong!');
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e as AxiosError));
  }
};

export const verifyOtp = async (
  dataToPost: VerifyOtpPayload,
  toast: any,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    setLoading(true);
    const { data } = await Axios.post<VerifyOtpResponse>(
      `${baseUrl}/auth/verify`,
      dataToPost
    );

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
    toast.error(catchErrors(e as AxiosError));
  }
};

export const updateAccount = async (
  dataToPost: FormData,
  toast: any,
  setLoading: Dispatch<SetStateAction<boolean>>,
  config?: any
) => {
  try {
    setLoading(true);
    const { data } = await Axios.put<UpdateProfileResponse>(
      `${baseUrl}/auth/`,
      dataToPost,
      {
        ...defaultConfig,
        ...config,
      }
    );

    if (data.status) {
      data.message && toast.success(data.message);
      Router.push('/');
    }
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e as AxiosError));
  }
};

export const redirectUser = (ctx: Context, location: string) => {
  if (ctx.res) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
};

export const logoutUser = async (toast: any) => {
  try {
    const { data } = await Axios.get(`${baseUrl}/auth/logout`);

    if (data.status) {
      Router.push('/authenticate');
    }
  } catch (e) {
    toast.error(catchErrors(e as AxiosError));
    Router.push('/authenticate');
  }
};
