import axios from 'axios';
import catchErrors from './catchErrors';
import baseUrl from './baseUrl';
import Router from 'next/router';
import { toast } from 'react-toastify';

export const deleteContact = async (userId, setLoading, toast, setContacts) => {
  try {
    setLoading(true);

    const { data } = await axios.delete(`${baseUrl}/users/${userId}`, {
      withCredentials: true,
    });

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
    toast.error(catchErrors(e));
  }
};

export const addContact = async (
  dataToPost,
  setLoading,
  setPhoneInfo,
  toast
) => {
  try {
    setLoading(true);

    const { data } = await axios.post(`${baseUrl}/users/add`, dataToPost, {
      withCredentials: true,
    });

    if (data.status) {
      setPhoneInfo({
        countryCode: '',
        setPhoneInfo: '',
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
      setPhoneInfo: '',
    });
    const error = catchErrors(e);
    toast.error(error);
  }
};
export const blockUnblockUser = async (
  dataToPost,
  setLoading,
  toast,
  block
) => {
  try {
    setLoading(true);

    const { data } = await axios.post(
      `${baseUrl}/users/${block ? 'block' : 'unblock'}/${dataToPost}`,
      {},
      {
        withCredentials: true,
      }
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
    const error = catchErrors(e);
    toast.error(error);
  }
};
