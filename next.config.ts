
import type {NextConfig} from 'next';
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // register: true, // Auto-register service worker
  // skipWaiting: true, // Install new service worker when available without waiting
  // Note: To test PWA features like the install prompt locally,
  // you generally need to build the production version (`npm run build`)
  // and then start the production server (`npm run start`).
  // The development server (`npm run dev`) might not trigger the install prompt
  // due to browser security restrictions or the 'disable' setting above.
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
