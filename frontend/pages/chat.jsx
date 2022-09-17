import React, { useContext, useEffect, useRef, useState } from 'react';
import ChatCard from '../components/Chat/ChatCard';
import ChatScreen from '../components/Chat/ChatScreen';
import NoChat from '../components/Chat/NoChat';
import { parseCookies } from 'nookies';
import axios from 'axios';
import io from 'socket.io-client';
import baseUrl from '../utils/baseUrl';
import { useRouter } from 'next/router';
import newMsgSound from '../utils/newMsgSound';
import Loader from '../components/shared/Layout/Loader';
import { deleteConversation } from '../utils/chatUtils';
import { toast } from 'react-toastify';
import PeerContext from '../context/PeerContext';

const scrollDivToBottom = (divRef) => {
  try {
    divRef.current !== null &&
      divRef.current.scrollIntoView({ behaviour: 'smooth' });
  } catch (err) {}
};

const Index = ({ user, conversationsData, error }) => {
  const [noChatSelected, setNoChatSelected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState(conversationsData);
  const router = useRouter();

  // Socket stuff
  // const socket = useRef();
  const { socket, peer, setCallModal } = useContext(PeerContext);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [firstRun, setFirstRun] = useState(true);

  // chat stuff
  const openChatId = useRef('');
  const divRef = useRef();
  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages, loading]);

  // connect user effect
  useEffect(() => {
    if (socket.current) {
      socket.current.off('connectedUsers').on('connectedUsers', ({ users }) => {
        setConnectedUsers(users);
        if (firstRun) {
          setFirstRun(false);
        }
      });

      if (!router.query.message) {
        setNoChatSelected(true);
      }
    }
  }, []);

  // Load messages effect
  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit('loadMessages', {
        userId: user._id,
        messagesWithUser: router.query.message,
      });

      socket.current
        .off('messagesLoaded')
        .on(
          'messagesLoaded',
          ({
            inContacts,
            messagesWith,
            messages,
            name,
            profilePicUrl,
            phoneNumber,
            isBlocked,
            selfBlocked,
          }) => {
            setMessages(messages);
            setBannerData({
              name,
              profilePicUrl,
              inContacts,
              phoneNumber,
              messagesWith,
              isBlocked,
              selfBlocked,
            });

            openChatId.current = messagesWith;
            console.log(bannerData);
            setNoChatSelected(false);
          }
        );

      socket.current
        .off('loadingMessagesFailed')
        .on('loadingMessagesFailed', () => {
          router.push('/chat', undefined, { shallow: true });
        });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  // message sent confirmation effect
  useEffect(() => {
    if (socket.current) {
      socket.current
        .off('messageSent')
        .on('messageSent', ({ newMessage, name, profilePicUrl }) => {
          if (newMessage.receiver === openChatId.current) {
            setMessages((prev) => [...prev, newMessage]);

            setConversations((prev) => {
              const prevConvo = prev.find(
                (convo) => convo.messagesWith === newMessage.receiver
              );

              const lastMessage = newMessage.message
                ? newMessage.message
                : newMessage.image && 'Image';

              if (prevConvo) {
                prevConvo.lastMessage = lastMessage;
                prevConvo.date = newMessage.date;
                return [...prev];
              } else {
                const newConversation = {
                  messagesWith: newMessage.receiver,
                  name,
                  profilePicUrl,
                  lastMessage,
                  date: newMessage.date,
                };

                return [newConversation, ...prev];
              }
            });
          }
        });
    }
  }, []);

  // message received use effect
  useEffect(() => {
    if (socket.current) {
      socket.current
        .off('newMessageReceived')
        .on(
          'newMessageReceived',
          ({ newMessage, senderName, senderProfilePic }) => {
            const lastMessage = newMessage.message
              ? newMessage.message
              : newMessage.image && 'Image';
            if (newMessage.sender === openChatId.current) {
              setMessages((prev) => [...prev, newMessage]);

              setConversations((prev) => {
                const prevConvo = prev.find(
                  (convo) => convo.messagesWith === newMessage.sender
                );

                if (prevConvo) {
                  prevConvo.lastMessage = lastMessage;
                  prevConvo.date = newMessage.date;
                  return [...prev];
                } else {
                  const newConversation = {
                    messagesWith: newMessage.sender,
                    name: senderName,
                    profilePicUrl: senderProfilePic,
                    lastMessage: lastMessage,
                    date: newMessage.date,
                  };

                  return [newConversation, ...prev];
                }
              });
              return;
            } else {
              const newConversation = {
                messagesWith: newMessage.sender,
                name: senderName,
                profilePicUrl: senderProfilePic,
                lastMessage: lastMessage,
                date: newMessage.date,
              };

              setConversations((prev) => {
                const prevConvo = prev.find(
                  (convo) => convo.messagesWith === newMessage.sender
                );

                if (prevConvo) {
                  return [
                    newConversation,
                    ...prev.filter(
                      (chat) =>
                        chat.messagesWith.toString() !==
                        newMessage.sender.toString()
                    ),
                  ];
                } else {
                  return [newConversation, ...prev];
                }
              });
            }
            newMsgSound();
          }
        );
    }
  }, []);

  // user blocks effect
  useEffect(() => {
    if (socket.current) {
      socket.current.off('userBlocked').on('userBlocked', ({ userId }) => {
        if (openChatId.current === userId) {
          setBannerData((prev) => {
            return {
              ...prev,
              isBlocked: true,
            };
          });
        }
      });

      socket.current.off('userUnblocked').on('userUnblocked', ({ userId }) => {
        if (openChatId.current === userId) {
          setBannerData((prev) => {
            return {
              ...prev,
              isBlocked: false,
            };
          });
        }
      });
    }
  }, []);

  // Typing status effect
  useEffect(() => {
    if (!socket.current) return;

    socket.current.off('onTypingStart').on('onTypingStart', ({ sender }) => {
      console.log(sender);
      if (sender === openChatId.current) {
        setIsRecipientTyping(true);
      }
    });
    socket.current.off('onTypingStop').on('onTypingStop', ({ sender }) => {
      if (sender === openChatId.current) {
        setIsRecipientTyping(false);
      }
    });
  }, []);

  const sendMessage = (message, imageUrl) => {
    if (message.length === 0 && !imageUrl) return;

    if (socket.current) {
      socket.current.emit('sendMessage', {
        userId: user._id,
        messagesWith: openChatId.current,
        messageBody: {
          message: message || undefined,
          image: imageUrl || undefined,
        },
      });

      socket.current.emit('onTypingStop', {
        messagesWith: openChatId.current,
        sender: user._id,
      });
      setIsTyping(false);
    }
  };

  const emitBlockUser = async () => {
    socket.current.emit('blockUser', {
      userId: user._id,
      targetId: bannerData.messagesWith,
    });

    setBannerData((prev) => {
      return {
        ...prev,
        selfBlocked: true,
      };
    });
  };

  const emitUnblockUser = async () => {
    socket.current.emit('unblockUser', {
      userId: user._id,
      targetId: bannerData.messagesWith,
    });

    setBannerData((prev) => {
      return {
        ...prev,
        selfBlocked: false,
      };
    });
  };

  const deleteConvo = async (messagesWith) => {
    await deleteConversation(
      messagesWith,
      setLoading,
      toast,
      router,
      conversations,
      setBannerData,
      setConversations,
      openChatId,
      setNoChatSelected
    );
  };

  const callUser = (userToCall) => {
    if (!peer.current || !peer.current.open) return;

    const info = {
      userId: user._id,
      userToCall,
      peerId: peer.current._id,
    };

    console.log(info);
    socket.current.emit('callUser', info, (data) => {
      setCallModal(data);
    });
  };

  const sendTypingStatus = () => {
    if (isTyping) {
      clearTimeout(timer);

      setTimer(
        setTimeout(() => {
          console.log('User stopped typing');

          socket.current.emit('onTypingStop', {
            messagesWith: openChatId.current,
            sender: user._id,
          });
          setIsTyping(false);
        }, 2000)
      );
    } else {
      setIsTyping(true);
      socket.current.emit('onTypingStart', {
        messagesWith: openChatId.current,
        sender: user._id,
      });
    }
  };

  if (error) {
    return <h1>Error</h1>;
  }
  if (firstRun || loading) {
    return <Loader />;
  }

  return (
    <div className='w-full h-[85vh] flex border border-border shadow-xl'>
      <div className='border border-border border-t-0 border-b-0 border-l-0 basis-1/4 rounded-sm flex flex-col'>
        <div className='flex-none basis-36  border border-border border-t-0 border-l-0 border-r-0  flex flex-col items-center justify-center px-5 py-4'>
          <h1 className='mb-4'>Search contact</h1>
          <input
            type='text'
            className='py-2 px-3 w-full font-normal rounded-md outline-none text-white font-roboto shadow-md
            opacity-95 focus:outline-buttonHover
            focus:opacity-100 transition-all ease-in-out duration-500 bg-card'
            placeholder='Contact'
          />
        </div>

        <div className='h-full flex flex-col overflow-y-auto'>
          {conversations.map((convo, i) => {
            return (
              <ChatCard
                key={i}
                conversation={convo}
                connectedUsers={connectedUsers}
              />
            );
          })}
        </div>
      </div>

      {/* FINE */}
      <div className='flex-1 shadow-sm h-full'>
        {noChatSelected ? (
          <NoChat />
        ) : (
          <ChatScreen
            user={user}
            bannerData={bannerData}
            messages={messages}
            sendMessage={sendMessage}
            divRef={divRef}
            setLoading={setLoading}
            emitBlockUser={emitBlockUser}
            emitUnblockUser={emitUnblockUser}
            deleteConvo={deleteConvo}
            callUser={callUser}
            sendTypingStatus={sendTypingStatus}
            isRecipientTyping={isRecipientTyping}
          />
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps(ctx) {
  try {
    const { token } = parseCookies(ctx);

    const { data } = await axios.get(`${baseUrl}/chats`, {
      withCredentials: true,
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return {
      props: {
        title: 'Chats | WhichApp',
        conversationsData: data.conversations,
      },
    };
  } catch (e) {
    console.log(e);
    return { props: { title: 'Chats | WhichApp', error: true } };
  }
}

export default Index;
