
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Initialize font object using the documented approach for Next.js App Router
// No need to call it as a function here if using the variable approach
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
         {/* <meta name="msapplication-config" content="/icons/browserconfig.xml" /> */}
         <meta name="msapplication-TileColor" content="#388E3C" /> {/* Updated tile color */}
         <meta name="msapplication-tap-highlight" content="no" />
         {/* Link to manifest */}
         <link rel="manifest" href="/manifest.json" />
         {/* Add other head elements like scripts or styles here */}
       </head>
      {/* Apply the font variable to the body */}
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
          {/* Google Translate Widget Placeholder */}
          <div id="google_translate_element" className="container mx-auto px-4 pt-4"></div>

          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}

          {/* Google Translate Initialization Scripts */}
          {/* Note: These scripts run client-side */}
          <script type="text/javascript">
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
              }
            `}
          </script>
          <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
      </body>
    </html>
  );
}

