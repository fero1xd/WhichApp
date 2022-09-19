/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'pranjal-test2.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
