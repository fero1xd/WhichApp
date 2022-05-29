import { GiTireIronCross } from 'react-icons/gi';
import Image from 'next/image';
import { useRouter } from 'next/router';

const ContactCard = ({ contact: { user, saveAsName }, removeContact }) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/chat?message=${user._id}`)}
      className='contact-card py-4 pt-10 border border-l-0 border-r-0 border-t-0 border-card flex justify-between
     items-center rounded-sm hover:shadow-xl transition-all ease-in-out duration-500'
    >
      <div className='flex gap-4 items-start'>
        <Image
          src={user.profilePicUrl}
          className='rounded-full'
          width={48}
          height={48}
          priority={true}
        />
        <div>
          <h1>{saveAsName}</h1>
          <p className='text-fade font-sans  text-sm font-light'>
            {user.phoneNumber.countryCode} {user.phoneNumber.number}
          </p>
        </div>
      </div>

      <GiTireIronCross
        className='opacity-50 cursor-pointer hover:opacity-100 transition-all ease-in-out duration-500'
        onClick={() => removeContact(user._id)}
      />
    </div>
  );
};

export default ContactCard;
