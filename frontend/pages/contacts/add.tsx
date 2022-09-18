import { useState } from 'react';
import Button from '../../components/shared/Layout/Button';
import Card from '../../components/shared/Layout/Card';
import { addContact } from '../../utils/userUtils';
import Loader from '../../components/shared/Layout/Loader';
import { toast } from 'react-toastify';
import { PhoneNumber } from '../../utils/types';

const AddContact = () => {
  const [name, setName] = useState<string>();
  const [phoneInfo, setPhoneInfo] = useState<PhoneNumber>({
    countryCode: '',
    number: '',
  });

  const [loading, setLoading] = useState(false);

  const { countryCode, number } = phoneInfo;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;

    setPhoneInfo((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dataToPost = {
      phoneNumber: {
        countryCode: '+' + countryCode,
        number,
      },
      saveAsName: name || undefined,
    };

    console.log(dataToPost);
    addContact(dataToPost, setLoading, setPhoneInfo, toast);
  };

  if (loading) {
    return (
      <Card>
        <Loader />
      </Card>
    );
  }

  return (
    <Card>
      <form
        className='flex flex-col  w-full mt-10 space-y-16 items-center'
        onSubmit={search}
      >
        <div className='w-full flex flex-col gap-4'>
          <h2>What will be there Name? (optional)</h2>
          <input
            type='text'
            maxLength={15}
            placeholder='Name'
            className='p-3 rounded-md w-full flex-1 outline-none text-dark font-sans font-medium opacity-95 focus:outline-buttonHover focus:opacity-100 transition-all ease-in-out duration-500'
            id='name'
            autoComplete='off'
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className='w-full flex flex-col gap-4'>
          <h2>Enter their phone number*</h2>
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
        </div>

        <Button text='Add' displayIcon />
      </form>
    </Card>
  );
};

export function getServerSideProps() {
  return {
    props: {
      title: 'Add Contact | WhichApp',
    },
  };
}

export default AddContact;
