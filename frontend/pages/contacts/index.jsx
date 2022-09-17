import React, { useState } from 'react';
import ContactCard from '../../components/Contacts/ContactCard';
import Button from '../../components/shared/Layout/Button';
import axios from 'axios';
import baseUrl from '../../utils/baseUrl';
import { parseCookies } from 'nookies';
import Loader from '../../components/shared/Layout/Loader';
import { toast } from 'react-toastify';
import Router from 'next/router';
import { deleteContact } from '../../utils/userUtils';

const getContacts = async (token) => {
  const { data } = await axios.get(`${baseUrl}/users`, {
    withCredentials: true,
    headers: {
      Cookie: `token=${token}`,
    },
  });
  return data;
};

const Contacts = ({ contactsData }) => {
  const [contacts, setContacts] = useState(contactsData);
  const [loading, setLoading] = useState(false);

  const removeContact = async (userId) => {
    await deleteContact(userId, setLoading, toast, setContacts);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='h-full w-full flex flex-col pt-14 gap-2'>
      <div className='ml-auto'>
        <Button text='Add' onClick={() => Router.push('/contacts/add')} />
      </div>

      <div className='flex flex-col relative'>
        {contacts.map((contact) => (
          <ContactCard contact={contact} removeContact={removeContact} />
        ))}
      </div>
    </div>
  );
};

export async function getServerSideProps(ctx) {
  const { token } = parseCookies(ctx);

  const data = await getContacts(token);
  return {
    props: {
      title: 'Contacts | WhichApp',
      contactsData: data.contacts,
    },
  };
}

export default Contacts;
