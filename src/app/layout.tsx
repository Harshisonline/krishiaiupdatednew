
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Initialize font object - GeistSans is an object, not a function
// const geistSans = GeistSans; // This was incorrect, GeistSans is imported directly

export const metadata: Metadata = {
    title: "KrishiAi+ | Smart Farming Platform",
    description: "AI-powered solutions for modern agriculture.",
    manifest: "/manifest.json", // Link to the manifest file
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#388E3C' }, // Primary color for light mode
    { media: '(prefers-color-scheme: dark)', color: '#4CAF50' }, // Slightly lighter green for dark mode
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
         <meta name="msapplication-TileColor" content="#388E3C" /> {/* Updated tile color */}
         <meta name="msapplication-tap-highlight" content="no" />

         {/* Link to manifest */}
         <link rel="manifest" href="/manifest.json" />
       </head>
      {/* Apply the font variable to the body */}
      <body
        className={`${GeistSans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
          <main className="container mx-auto px-4 py-8 mt-12">{children}</main> {/* Added margin-top to avoid overlap with translate widget */}
          <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
