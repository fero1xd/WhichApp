import React, { useState, useRef } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import { BiImage } from 'react-icons/bi';
import { IoMdRemoveCircle } from 'react-icons/io';
import { blockUnblockUser } from '../../utils/userUtils';
import { toast } from 'react-toastify';
import uploadToCloudinary from '../../utils/uploadToCloudinary';
import Loader from '../shared/Layout/Loader';

const BottomField = ({
  bannerData,
  text,
  sendMessage,
  setText,
  setLoading,
  isYellow,
  isRed,
  emitBlockUser,
  emitUnblockUser,
}) => {
  const [media, setMedia] = useState(null);
  const inputRef = useRef();
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const [sendLoading, setSendLoading] = useState(false);

  const handleChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    if (!acceptedImageTypes.includes(files[0]['type'])) {
      return toast.error('Please select valid image');
    }

    setMedia(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sendLoading) return;
    setSendLoading(true);
    if (text.length === 0 && !media) return;

    let imageUrl;
    if (media != null) {
      imageUrl = await uploadToCloudinary(media);
    }

    if (media != null && !imageUrl) {
      return toast.error('Error uploading image');
    }

    sendMessage(text, imageUrl);
    setText('');
    setMedia(null);
    setSendLoading(false);
  };

  return (
    <>
      {bannerData.inContacts &&
      !bannerData.isBlocked &&
      !bannerData.selfBlocked ? (
        !sendLoading ? (
          <>
            <form
              className='h-24 w-full border-t p-6 border-border flex items-center justify-between gap-7'
              onSubmit={handleSubmit}
            >
              <input
                type='text'
                maxLength={100}
                placeholder='Message'
                className={`flex-1 flex-shrink-0 p-3 rounded-md w-full outline-none bg-card text-white font-roboto shadow-md
            font-light opacity-95 ${
              isYellow
                ? 'focus:outline-yellow-600'
                : isRed
                ? 'focus:outline-red-600'
                : 'focus:outline-buttonHover'
            } focus:opacity-100 transition-all ease-in-out duration-700`}
                id='name'
                value={text}
                autoComplete='off'
                onChange={(e) => setText(e.target.value)}
              />
              <div className='flex gap-6 items-center'>
                <input
                  type='file'
                  accept='image/png, image/gif, image/jpeg'
                  className='hidden'
                  ref={inputRef}
                  onChange={handleChange}
                />

                {!media ? (
                  <BiImage
                    className='flex-none w-8 h-8 cursor-pointer'
                    onClick={() => inputRef.current.click()}
                  />
                ) : (
                  <IoMdRemoveCircle
                    className='flex-none w-8 h-8 cursor-pointer'
                    onClick={() => setMedia(null)}
                  />
                )}

                <AiOutlineSend
                  className='flex-none w-6 h-6'
                  cursor='pointer'
                  onClick={() => {
                    if (text.length === 0) return;
                    sendMessage(text);
                    setText('');
                  }}
                />
              </div>
            </form>
          </>
        ) : (
          <Loader />
        )
      ) : (
        <>
          <div className='h-24 w-full border-t p-6 border-border flex items-center justify-center'>
            {!sendLoading ? (
              <>
                <h1 className='text-widest font-sans flex items-center justify-center flex-col'>
                  {bannerData.selfBlocked ? (
                    <>
                      You have blocked this user
                      <p
                        className='text-button block cursor-pointer'
                        onClick={async () => {
                          await blockUnblockUser(
                            bannerData.messagesWith,
                            setLoading,
                            toast,
                            false
                          );

                          emitUnblockUser();
                        }}
                      >
                        Unblock Them?
                      </p>
                    </>
                  ) : bannerData.isBlocked ? (
                    <p>This user has blocked you</p>
                  ) : (
                    !bannerData.inContacts && (
                      <>
                        This user is not in your contacts
                        <p
                          className='text-button block cursor-pointer'
                          onClick={async () => {
                            await blockUnblockUser(
                              bannerData.messagesWith,
                              setLoading,
                              toast,
                              true
                            );

                            emitBlockUser();
                          }}
                        >
                          Block them ?
                        </p>
                      </>
                    )
                  )}
                </h1>
              </>
            ) : (
              <Loader />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default BottomField;
