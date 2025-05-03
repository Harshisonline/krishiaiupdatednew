
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import GoogleTranslateWidget from '@/components/google-translate-widget'; // Import the new client component
import Script from 'next/script';


// Initialize font object using the documented approach for Next.js App Router
const geistSans = GeistSans;


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
       {/* Ensure no whitespace directly inside head */}
       <head>
         {/* Add meta tags for PWA */}
         <meta name="application-name" content="KrishiAi+" />
         <meta name="apple-mobile-web-app-capable" content="yes" />
         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
         <meta name="apple-mobile-web-app-title" content="KrishiAi+" />
         <meta name="format-detection" content="telephone=no" />
         <meta name="mobile-web-app-capable" content="yes" />
         <meta name="msapplication-TileColor" content="#388E3C" />
         <meta name="msapplication-tap-highlight" content="no" />
         <link rel="manifest" href="/manifest.json" />
         {/* Add other head elements like scripts or styles here */}
       </head>
      {/* Apply the font variable to the body */}
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
          {/* Render the Google Translate widget using the client component */}
          <GoogleTranslateWidget />

          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}

          {/* Load the Google Translate script */}
          <Script
            src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
      </body>
    </html>
  );
}
