import axios, { AxiosError } from 'axios';
import { NextRouter } from 'next/router';
import { SetStateAction } from 'react';
import { MutableRefObject } from 'react';
import { Dispatch } from 'react';
import baseUrl from './baseUrl';
import catchErrors from './catchErrors';
import { BannerData, Conversation } from './types';

export const deleteConversation = async (
  messagesWith: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  toast: any,
  router: NextRouter,
  conversations: Conversation[],
  setBannerData: Dispatch<SetStateAction<BannerData | undefined>>,
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
  openChatId: MutableRefObject<string>,
  setNoChatSelected: Dispatch<SetStateAction<boolean>>
) => {
  setLoading(true);

  try {
    await axios.delete(`${baseUrl}/chats/${messagesWith}`, {
      withCredentials: true,
    });

    setBannerData(undefined);

    setConversations(
      conversations.filter(
        (convo) => convo.messagesWith.toString() != messagesWith
      )
    );

    openChatId.current = '';
    setNoChatSelected(true);

    router.push('/chat', undefined, { shallow: true });
    return setLoading(false);
  } catch (e) {
    setLoading(false);
    const err = catchErrors(e as AxiosError);
    toast.error(err);
  }

  setLoading(false);
};
