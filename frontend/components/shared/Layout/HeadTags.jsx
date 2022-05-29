import React from 'react';
import Head from 'next/head';

const HeadTags = ({ title }) => {
  return (
    <Head>
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap'
      />
      <link rel='icon' type='image/x-icon' href='/favicon.png' />

      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />
      <link
        href='https://fonts.googleapis.com/css2?family=Roboto&display=swap'
        rel='stylesheet'
      />
      <title>{title}</title>
    </Head>
  );
};

HeadTags.defaultProps = {
  title: 'WhichApp',
};

export default HeadTags;
