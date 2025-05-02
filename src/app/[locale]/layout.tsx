
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Temporarily remove Mono
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { locales } from '../../../i18n'; // Adjust path if needed
import LanguageSwitcher from '@/components/LanguageSwitcher'; // Import LanguageSwitcher

// Initialize fonts using the standard documented way
const geistSans = GeistSans({ // Use lowercase for variable
  variable: '--font-geist-sans',
  // Ensure subsets are removed or correctly configured if needed. Removing for safety.
});

// const geistMono = GeistMono({ // Temporarily remove Mono
//   variable: '--font-geist-mono',
// });


// Function to generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // Validate locale first
  if (!locales.includes(locale)) {
     console.error(`Invalid locale detected in generateMetadata: ${locale}`);
    notFound();
  }

  // Load messages for the current locale
  let messages;
  try {
     // Ensure the path is correct relative to this file's location
     messages = (await import(`../../../messages/${locale}.json`)).default;
     if (!messages || !messages.Metadata) {
       throw new Error(`Metadata section missing in messages/${locale}.json`);
     }
  } catch (error) {
    console.error(`Could not load or parse messages for locale: ${locale}`, error);
    // Trigger a 404 if messages can't be loaded or are invalid
    notFound();
  }

  // Simple translation helper using loaded messages
  const t = (key: string) => messages.Metadata?.[key] || `Missing Metadata.${key}`;

  return {
    title: t('title'),
    description: t('description'),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}


// Function to generate static params for SSG
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale early in the component rendering
  if (!locales.includes(locale)) {
     console.error(`Invalid locale detected in RootLayout render: ${locale}`);
    notFound();
  }

  // useMessages must be called within the component to access context
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body
        // Removed geistMono.variable
        className={`${geistSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {/* Pass the validated locale and loaded messages to the provider */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="absolute top-4 right-4 z-50">
             <LanguageSwitcher />
          </div>
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster /> {/* Add Toaster component */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

