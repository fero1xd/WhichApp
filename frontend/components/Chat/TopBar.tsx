import React, { useContext } from 'react';
import { IoMdCall } from 'react-icons/io';
import { AiFillDelete } from 'react-icons/ai';
import { MdBlock } from 'react-icons/md';
import { toast } from 'react-toastify';
import { blockUnblockUser } from '../../utils/userUtils';
import { BannerData } from '../../utils/types';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import { NextPage } from 'next';
import replaceExt from 'replace-ext';
import { useState } from 'react';

type TopBarProps = {
  bannerData: BannerData;
  setLoading: Dispatch<SetStateAction<boolean>>;
  emitBlockUser: () => void;
  deleteConvo: (messagesWith: string) => void;
  callUser: (userToCall: string) => void;
  isRecipientTyping: boolean;
};

const TopBar: NextPage<TopBarProps> = ({
  bannerData,
  setLoading,
  emitBlockUser,
  deleteConvo,
  callUser,
  isRecipientTyping,
}) => {
  const [finalImage, setFinalImage] = useState(
    replaceExt(bannerData.profilePicUrl, '.png')
  );
  const { profilePicUrl } = bannerData;

  return (
    <div className='h-24 w-full flex items-center justify-between px-10 py-6 border-b border-border'>
      <div className='flex items-center gap-4'>
        <img
          className='w-10 h-10 rounded-full object-cover'
          src={finalImage}
          alt=''
          onMouseEnter={() => {
            if (profilePicUrl.endsWith('.gif') && finalImage.endsWith('.png')) {
              setFinalImage(profilePicUrl);
            }
          }}
          onMouseLeave={() => {
            if (profilePicUrl.endsWith('.gif') && finalImage.endsWith('.gif')) {
              setFinalImage(replaceExt(profilePicUrl, '.png'));
            }
          }}
        />

        <div className='flex flex-col items-start justify-center'>
          <h1>{bannerData.name}</h1>
          <p className='text-xs font-sans text-gray-600'>
            {isRecipientTyping ? (
              <span className='text-green-400 font-sans'>
                {bannerData.name} is typing....
              </span>
            ) : (
              `${bannerData.phoneNumber.countryCode} ${bannerData.phoneNumber.number}`
            )}
          </p>
        </div>
      </div>

      <div className='flex gap-6 items-center'>
        <IoMdCall
          className={`w-6 h-6  ${
            bannerData.selfBlocked || bannerData.isBlocked
              ? 'opacity-60 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onClick={() => {
            if (bannerData.selfBlocked || bannerData.isBlocked) return;
            callUser(bannerData.messagesWith);
          }}
        />

        <MdBlock
          className={`w-6 h-6 ${
            bannerData.selfBlocked || bannerData.isBlocked
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onClick={async () => {
            if (bannerData.selfBlocked) return;

            await blockUnblockUser(
              bannerData.messagesWith,
              setLoading,
              toast,
              true
            );

            emitBlockUser();
          }}
        />
        <AiFillDelete
          className='w-6 h-6 cursor-pointer'
          onClick={async () => {
            deleteConvo(bannerData.messagesWith);
          }}
        />
      </div>
    </div>
  );
};

export default TopBar;
