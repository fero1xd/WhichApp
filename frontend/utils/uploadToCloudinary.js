const axios = require('axios');

const uploadPic = async (media) => {
  try {
    const form = new FormData();

    form.append('file', media);
    form.append('upload_preset', 'kzwefxhg');
    form.append('cloud_name', 'dokrhp41c');

    const { data } = await axios.post(
      process.env.NEXT_PUBLIC_CLOUDINARY_URL,
      form
    );
    return data.secure_url;
  } catch (error) {
    return;
  }
};

export default uploadPic;
