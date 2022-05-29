import { useState, useEffect, useRef } from 'react';
import Button from '../shared/Layout/Button';
import { requestOtp, verifyOtp } from '../../utils/authUtils';
import { toast } from 'react-toastify';

const Otp = ({
  hash,
  setHash,
  phoneInfo: { countryCode, phoneNumber },
  setLoading,
  loading,
}) => {
  const [resendDisabled, setResendDisabled] = useState(
    Date.now() < +hash.split('.')[1]
  );
  const [resendTries, setResentTries] = useState(0);

  function OTPInput() {
    const inputs = document.querySelectorAll('#otp > *[id]');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('keydown', function (event) {
        if (event.key === 'Backspace') {
          inputs[i].value = '';
          if (i !== 0) inputs[i - 1].focus();
        } else {
          if (i === inputs.length - 1 && inputs[i].value !== '') {
            return true;
          } else if (event.keyCode > 47 && event.keyCode < 58) {
            inputs[i].value = event.key;
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          } else if (event.keyCode > 64 && event.keyCode < 91) {
            inputs[i].value = String.fromCharCode(event.keyCode);
            if (i !== inputs.length - 1) inputs[i + 1].focus();
            event.preventDefault();
          }
        }
      });
    }
  }

  useEffect(() => {
    OTPInput();

    const interval = setInterval(() => {
      setResendDisabled(Date.now() < +hash.split('.')[1]);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {}, []);

  const resendOtp = async (e) => {
    e.preventDefault();
    if (resendDisabled) return;

    const data = await requestOtp(
      {
        countryCode: '+' + countryCode,
        phoneNumber,
      },
      toast,
      setLoading
    );

    console.log(data);
    setResentTries((prev) => prev + 1);
    setHash(data.hash);
    toast.success('Otp regenrated!');
  };
  return (
    <>
      <img src='/favicon.png' alt='Logo' className='w-24' />
      <h1 className='text-xl text-white mt-4 font-bold tracking-wider'>
        Enter the OTP!
      </h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const inputs = document.querySelectorAll('#otp > *[id]');
          const res = '';
          inputs.forEach((input) => (res += input.value));

          const dataToPost = {
            otp: res,
            hash,
            countryCode: '+' + countryCode,
            phoneNumber,
          };
          await verifyOtp(dataToPost, toast, setLoading);
        }}
        className='flex flex-col max-w-sm w-full mt-10 space-y-5 items-center'
      >
        <div className='flex items-center flex-col gap-2'>
          <div
            id='otp'
            className='flex flex-row justify-center text-center px-2'
          >
            {['first', 'second', 'third', 'fourth', 'fifth', 'sixth'].map(
              (pos, i) => (
                <input
                  key={i}
                  className='text-dark mr-3 border h-10 w-10 text-center form-control rounded-md opacity-95 outline-none focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
                  type='text'
                  id={pos}
                  maxLength='1'
                  required
                  autoComplete='off'
                />
              )
            )}
          </div>

          <p
            href='#'
            className={`text-sm font-sans text-buttonHover underline ${
              resendDisabled ? 'cursor-default' : 'cursor-pointer'
            } ${resendDisabled && 'text-gray-400'}`}
            onClick={resendOtp}
          >
            Resend Otp?
          </p>
        </div>
        <Button displayIcon text='Continue' disabled={loading} />
      </form>
    </>
  );
};

export default Otp;
