import axios, { AxiosError } from 'axios';
import catchErrors from './catchErrors';
import baseUrl from './baseUrl';
import Router from 'next/router';
import { SetStateAction, Dispatch } from 'react';
import { AddContactPayload, Contact, PhoneNumber } from './types';

const Axios = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export const deleteContact = async (
  userId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  toast: any,
  setContacts: Dispatch<SetStateAction<Contact[]>>
) => {
  try {
    setLoading(true);

    const { data } = await Axios.delete<{ status: string }>(
      `${baseUrl}/users/${userId}`
    );

    if (data.status) {
      setContacts((prev) =>
        prev.filter((contact) => contact.user._id != userId)
      );
      setLoading(false);
      toast.success('Contact deleted');
      return;
    }

    throw new Error('Something went wrong');
  } catch (e) {
    setLoading(false);
    toast.error(catchErrors(e as AxiosError));
  }
};

export const addContact = async (
  dataToPost: AddContactPayload,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setPhoneInfo: Dispatch<SetStateAction<PhoneNumber>>,
  toast: any
) => {
  try {
    setLoading(true);

    const { data } = await Axios.post<{ status: string }>(
      `${baseUrl}/users/add`,
      dataToPost
    );

    if (data.status) {
      setPhoneInfo({
        countryCode: '',
        number: '',
      });
      Router.push('/contacts');
      return;
    }

    throw new Error('Something went wrong');
  } catch (e) {
    console.log(e);
    setLoading(false);
    setPhoneInfo({
      countryCode: '',
      number: '',
    });
    const error = catchErrors(e as AxiosError);
    toast.error(error);
  }
};
export const blockUnblockUser = async (
  dataToPost,
  setLoading: Dispatch<SetStateAction<boolean>>,
  toast: any,
  block: boolean
) => {
  try {
    setLoading(true);

    const { data } = await Axios.patch(
      `${baseUrl}/users/${block ? 'block' : 'unblock'}/${dataToPost}`
    );

    if (data.status) {
      // Router.reload();
      setLoading(false);
      return;
    }

    throw new Error('Something went wrong');
  } catch (e) {
    console.log(e);
    setLoading(false);
    const error = catchErrors(e as AxiosError);
    toast.error(error);
  }
};
