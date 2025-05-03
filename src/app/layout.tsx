import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import GoogleTranslateWidget from '@/components/google-translate-widget'; // Import the client component
import Script from 'next/script';
import { cn } from "@/lib/utils"; // Import cn utility


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
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning */}
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
          {/* Preconnect to Google Translate domains */}
          <link rel="preconnect" href="https://translate.google.com" />
          <link rel="preconnect" href="https://translate.googleapis.com" />
         {/* Add other head elements like scripts or styles here */}
       </head>
      {/* Apply the font variable to the body */}
      <body
         className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable // Use the imported font object correctly
        )}
      >
          {/* Render the Google Translate widget using the client component */}
          {/* Ensure this component renders the necessary div#google_translate_element */}
          <GoogleTranslateWidget />

          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}

          {/* Load the Google Translate script after the DOM is ready */}
          {/* Using strategy="lazyOnload" defers loading until after essential resources */}
          <Script
            id="google-translate-script" // Added an ID for clarity
            src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="lazyOnload" // Changed strategy
            // onError removed as it causes issues with Server Components
          />
      </body>
    </html>
  );
}
