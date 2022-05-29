import axios from 'axios';
import baseUrl from './baseUrl';
import catchErrors from './catchErrors';

export const deleteConversation = async (
  messagesWith,
  setLoading,
  toast,
  router,
  conversations,
  setBannerData,
  setConversations,
  openChatId,
  setNoChatSelected
) => {
  try {
    await axios.delete(`${baseUrl}/chats/${messagesWith}`, {
      withCredentials: true,
    });

    setBannerData({});

    setConversations(
      conversations.filter(
        (convo) => convo.messagesWith.toString() != messagesWith
      )
    );

    openChatId.current = '';
    setNoChatSelected(true);

    router.push('/chat', undefined, { shallow: true });
    setLoading(false);
  } catch (e) {
    setLoading(false);
    const err = catchErrors(e);
    toast.error(err);
  }
};
