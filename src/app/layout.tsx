
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Use the imported object directly for class names.
const geistSans = GeistSans;


export const metadata: Metadata = {
    title: "KrishiAi+ | Smart Farming Platform",
    description: "AI-powered solutions for modern agriculture.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        // Apply font variable correctly using the imported object's variable property
        className={`${geistSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
         {/* Language switcher removed */}
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
