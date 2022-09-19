import React, { useContext, useEffect, useRef, useState } from 'react';
import ChatCard from '../components/Chat/ChatCard';
import ChatScreen from '../components/Chat/ChatScreen';
import NoChat from '../components/Chat/NoChat';
import { parseCookies } from 'nookies';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import { useRouter } from 'next/router';
import newMsgSound from '../utils/newMsgSound';
import Loader from '../components/shared/Layout/Loader';
import { deleteConversation } from '../utils/chatUtils';
import { toast } from 'react-toastify';
import PeerSocketContext from '../context/PeerSocketContext';
import { GetServerSideProps, NextPage } from 'next';
import {
  BannerData,
  CallType,
  ConnectedUser,
  Conversation,
  Message,
  User,
} from '../utils/types';
import { createRef } from 'react';
import { RefObject } from 'react';

const scrollDivToBottom = (divRef: RefObject<HTMLDivElement>) => {
  try {
    divRef.current && divRef.current.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {}
};

type ChatPageProps = {
  user: User;
  error: boolean;
  conversationsData: Conversation[];
};

const Chat: NextPage<ChatPageProps> = ({ user, conversationsData, error }) => {
  const [noChatSelected, setNoChatSelected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState(conversationsData);
  const router = useRouter();

  // Socket stuff
  const { socket, peer, setCallModal, peerId } = useContext(PeerSocketContext);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  // chat stuff
  const openChatId = useRef<string>('');
  const divRef = createRef<HTMLDivElement>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [bannerData, setBannerData] = useState<BannerData>();
  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();

  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages, loading]);

  // Waiting for socket and peer to get initialized
  useEffect(() => {
    if (socket && socket.connected && peer && peer.open) {
      setLoading(false);
    }
  }, [socket, peer]);

  // connect user effect
  useEffect(() => {
    if (socket) {
      socket
        .off('connectedUsers')
        .on('connectedUsers', ({ users }: { users: ConnectedUser[] }) => {
          setConnectedUsers(users);
        });

      if (!router.query.message) {
        setNoChatSelected(true);
      }
    }
  }, [socket]);

  // Load messages effect
  useEffect(() => {
    const loadMessages = () => {
      if (!socket) return;

      socket.emit('loadMessages', {
        userId: user._id,
        messagesWithUser: router.query.message,
      });

      socket
        .off('messagesLoaded')
        .on('messagesLoaded', ({ messages, ...data }) => {
          setMessages(messages as Message[]);
          setBannerData({
            ...data,
          });

          openChatId.current = data.messagesWith;
          setNoChatSelected(false);
        });

      socket.off('loadingMessagesFailed').on('loadingMessagesFailed', () => {
        router.push('/chat', undefined, { shallow: true });
      });
    };

    if (socket && router.query.message) loadMessages();
  }, [router.query.message, socket]);

  // message sent confirmation effect
  useEffect(() => {
    if (socket) {
      socket
        .off('messageSent')
        .on(
          'messageSent',
          ({
            newMessage,
            name,
            profilePicUrl,
          }: {
            newMessage: Message;
            name: string;
            profilePicUrl: string;
          }) => {
            if (newMessage.receiver === openChatId.current) {
              setMessages((prev) => [...prev, newMessage]);

              setConversations((prev) => {
                const prevConvo = prev.find(
                  (convo) => convo.messagesWith === newMessage.receiver
                );

                const lastMessage = (
                  newMessage.message
                    ? newMessage.message
                    : newMessage.image && 'Image'
                )!;

                if (prevConvo) {
                  prevConvo.lastMessage = lastMessage;
                  prevConvo.date = newMessage.date;
                  return [...prev];
                } else {
                  const newConversation: Conversation = {
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
          }
        );
    }
  }, [socket]);

  // message received effect
  useEffect(() => {
    if (socket) {
      socket
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
  }, [socket]);

  // user block/unblock effect
  useEffect(() => {
    if (socket) {
      socket
        .off('userBlocked')
        .on('userBlocked', ({ userId }: { userId: string }) => {
          if (openChatId.current === userId) {
            setBannerData((prev) => {
              return {
                ...prev!,
                isBlocked: true,
              };
            });
          }
        });

      socket
        .off('userUnblocked')
        .on('userUnblocked', ({ userId }: { userId: string }) => {
          if (openChatId.current === userId) {
            setBannerData((prev) => {
              return {
                ...prev!,
                isBlocked: false,
              };
            });
          }
        });
    }
  }, [socket]);

  // Typing status effect
  useEffect(() => {
    if (!socket) return;

    socket
      .off('onTypingStart')
      .on('onTypingStart', ({ sender }: { sender: string }) => {
        console.log(sender);

        setConversations((prev) => {
          const found = prev.find((convo) => convo.messagesWith === sender);
          if (found) {
            found.isTyping = true;
            return [...prev];
          }
          return [...prev];
        });
      });
    socket
      .off('onTypingStop')
      .on('onTypingStop', ({ sender }: { sender: string }) => {
        setConversations((prev) => {
          const found = prev.find((convo) => convo.messagesWith === sender);
          if (found && found.isTyping) {
            found.isTyping = false;
            return [...prev];
          }
          return [...prev];
        });
      });
  }, [socket]);

  const sendMessage = (message: string, imageUrl?: string) => {
    if (message.length === 0 && !imageUrl) return;

    if (socket) {
      socket.emit('sendMessage', {
        userId: user._id,
        messagesWith: openChatId.current,
        messageBody: {
          message: message || undefined,
          image: imageUrl || undefined,
        },
      });

      socket.emit('onTypingStop', {
        messagesWith: openChatId.current,
        sender: user._id,
      });
      setIsTyping(false);
    }
  };

  const emitBlockUser = async () => {
    if (!socket || !bannerData) return;

    socket.emit('blockUser', {
      userId: user._id,
      targetId: bannerData.messagesWith,
    });

    setBannerData((prev) => {
      return {
        ...prev!,
        selfBlocked: true,
      };
    });
  };

  const emitUnblockUser = async () => {
    if (!socket || !bannerData) return;

    socket.emit('unblockUser', {
      userId: user._id,
      targetId: bannerData.messagesWith,
    });

    setBannerData((prev) => {
      return {
        ...prev!,
        selfBlocked: false,
      };
    });
  };

  const deleteConvo = async (messagesWith: string) => {
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

  const callUser = (userToCall: string) => {
    if (!peer || !peer.open || !socket || !peerId) return;

    const info = {
      userId: user._id,
      userToCall,
      peerId,
    };

    socket.emit('callUser', info, (data: CallType) => {
      setCallModal!(data);
    });
  };

  const sendTypingStatus = () => {
    if (!socket) return;

    if (isTyping) {
      clearTimeout(timer);

      setTimer(
        setTimeout(() => {
          socket.emit('onTypingStop', {
            messagesWith: openChatId.current,
            sender: user._id,
          });
          setIsTyping(false);
        }, 2000)
      );
    } else {
      setIsTyping(true);
      socket.emit('onTypingStart', {
        messagesWith: openChatId.current,
        sender: user._id,
      });
    }
  };

  if (error) {
    return <h1>Error</h1>;
  }
  if (loading) {
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
                openChatId={openChatId.current}
                key={i}
                conversation={convo}
                connectedUsers={connectedUsers}
              />
            );
          })}
        </div>
      </div>

      <div className='flex-1 shadow-sm h-full'>
        {noChatSelected ? (
          <NoChat />
        ) : (
          <ChatScreen
            conversations={conversations}
            user={user}
            bannerData={bannerData!}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);

    const { data: conversations } = await axios.get<Conversation[]>(
      `${baseUrl}/chats`,
      {
        withCredentials: true,
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

    return {
      props: {
        title: 'Chats | WhichApp',
        conversationsData: conversations,
      },
    };
  } catch (e) {
    console.log(e);
    return { props: { title: 'Chats | WhichApp', error: true } };
  }
};

export default Chat;
