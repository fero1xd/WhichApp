import React, { useState } from 'react';
import Card from '../components/shared/Layout/Card';
import Phone from '../components/Steps/Phone';
import Otp from '../components/Steps/Otp';
import Loader from '../components/shared/Layout/Loader';
import { PhoneNumber } from '../utils/types';

const Authenticate = () => {
  const [phoneInfo, setPhoneInfo] = useState<PhoneNumber>({
    countryCode: '',
    number: '',
  });

  const [step, setStep] = useState(0);
  const [hash, setHash] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;

    setPhoneInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  if (loading)
    return (
      <Card>
        <Loader />
        <h1 className='text-xl text-bold mt-5'>Please wait!</h1>
      </Card>
    );

  return (
    <Card>
      {step === 0 ? (
        <Phone
          onChange={onChange}
          phoneInfo={phoneInfo}
          setStep={setStep}
          setHash={setHash}
          setLoading={setLoading}
          loading={loading}
        />
      ) : (
        <Otp
          hash={hash!}
          phoneInfo={phoneInfo}
          setLoading={setLoading}
          loading={loading}
        />
      )}
    </Card>
  );
};

export function getServerSideProps() {
  return {
    props: {
      title: 'Authenticate | WhichApp',
    },
  };
}

export default Authenticate;
