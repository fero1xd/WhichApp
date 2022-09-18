import axios from 'axios';

const uploadPic = async (media: File) => {
  try {
    const form = new FormData();

    form.append('file', media);
    form.append('upload_preset', 'kzwefxhg');
    form.append('cloud_name', 'dokrhp41c');

    const { data } = await axios.post(
      process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      form
    );

    return data.secure_url as string;
  } catch (error) {
    return;
  }
};

export default uploadPic;
