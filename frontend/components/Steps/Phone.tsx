import Button from '../shared/Layout/Button';
import { requestOtp } from '../../utils/authUtils';
import { toast } from 'react-toastify';
import { PhoneNumber } from '../../utils/types';
import { NextPage } from 'next';
import { Dispatch, SetStateAction, ChangeEvent } from 'react';

type PhonePageProps = {
  phoneInfo: PhoneNumber;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setStep: Dispatch<SetStateAction<number>>;
  setHash: Dispatch<SetStateAction<string | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
};

const Phone: NextPage<PhonePageProps> = ({
  phoneInfo: { countryCode, number },
  onChange,
  setStep,
  setHash,
  setLoading,
  loading,
}) => {
  return (
    <>
      <img src='/favicon.png' alt='Logo' className='w-24' />
      <h1 className='text-xl text-white mt-4 font-bold tracking-wider'>
        Get Access to WhichApp!
      </h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const data = await requestOtp(
            {
              countryCode: '+' + countryCode,
              number,
            },
            toast,
            setLoading
          );
          if (!data) return;

          console.log(data);
          setHash(data.hash);
          setStep(1);
        }}
        className='flex flex-col max-w-sm w-full mt-10 space-y-5 items-center'
      >
        <div className='flex w-full justify-center'>
          <input
            type='text'
            className='text-dark w-20 mr-3 p-3 outline-none rounded-sm font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
            placeholder='Code'
            id='countryCode'
            onChange={onChange}
            value={countryCode}
            maxLength={3}
            min={1}
            autoComplete='off'
            required
          />

          <input
            type='text'
            maxLength={16}
            minLength={10}
            placeholder='Phone Number'
            className='p-3 rounded-md flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
            onChange={onChange}
            value={number}
            id='number'
            autoComplete='off'
            required
          />
        </div>
        <Button displayIcon text='Continue' disabled={loading} />
      </form>
    </>
  );
};

export default Phone;
