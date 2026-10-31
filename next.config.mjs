/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default baseConfig;
