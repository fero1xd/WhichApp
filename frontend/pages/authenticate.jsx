import React, { useState } from 'react';
import Card from '../components/shared/Layout/Card';
import Phone from '../components/Steps/Phone';
import Otp from '../components/Steps/Otp';
import Loader from '../components/shared/Layout/Loader';

const Authenticate = () => {
  const [phoneInfo, setPhoneInfo] = useState({
    countryCode: '',
    phoneNumber: '',
  });

  const [step, setStep] = useState(0);
  const [hash, setHash] = useState();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { value, id } = e.target;

    if (!isNaN(value)) {
      setPhoneInfo((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
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
          hash={hash}
          setHash={setHash}
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
