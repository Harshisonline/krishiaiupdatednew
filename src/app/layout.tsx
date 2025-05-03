
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = GeistSans;


export const metadata: Metadata = {
    title: "KrishiAi+ | Smart Farming Platform",
    description: "AI-powered solutions for modern agriculture.",
    manifest: "/manifest.json", // Link to the manifest file
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4d7c44' }, // Primary color for light mode
    { media: '(prefers-color-scheme: dark)', color: '#639a5a' }, // Primary color for dark mode
  ],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
       <head>
         {/* Add meta tags for PWA */}
         <meta name="application-name" content="KrishiAi+" />
         <meta name="apple-mobile-web-app-capable" content="yes" />
         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
         <meta name="apple-mobile-web-app-title" content="KrishiAi+" />
         <meta name="format-detection" content="telephone=no" />
         <meta name="mobile-web-app-capable" content="yes" />
         {/* <meta name="msapplication-config" content="/icons/browserconfig.xml" /> */}
         <meta name="msapplication-TileColor" content="#4d7c44" />
         <meta name="msapplication-tap-highlight" content="no" />
         {/* <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
         <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
         <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
         <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" /> */}

         {/* <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
         <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" /> */}
         {/* <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" /> */}
         {/* <link rel="shortcut icon" href="/favicon.ico" /> */}
       </head>
      <body
        className={`${geistSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
