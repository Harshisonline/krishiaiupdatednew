
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
// Remove useMessages import here, it's only for client components inside the provider
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '../../../i18n'; // Adjust path if needed
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Correctly assign the font object.
const geistSans = GeistSans;

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
     messages = (await import(`../../../messages/${locale}.json`)).default;
     if (!messages || !messages.Metadata) {
       throw new Error(`Metadata section missing in messages/${locale}.json`);
     }
  } catch (error) {
    console.error(`Could not load or parse messages for locale: ${locale}`, error);
    notFound();
  }

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

// Helper function to fetch messages server-side
async function getMessages(locale: string) {
  if (!locales.includes(locale)) {
    console.error(`Invalid locale passed to getMessages: ${locale}`);
    notFound();
  }
  try {
    // Adjust path relative to the layout file
    return (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}" in layout:`, error);
    notFound(); // Throw 404 if messages are missing
  }
}

// Make the RootLayout component async to fetch messages
export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale early
  // This check might be redundant if middleware handles it, but good for safety.
  if (!locales.includes(locale)) {
     console.error(`Invalid locale detected in RootLayout render: ${locale}`);
    notFound();
  }

  // Fetch messages server-side
  const messages = await getMessages(locale);

  // DO NOT call useMessages() here. It's for Client Components.

  return (
    <html lang={locale}>
      <body
        // Apply font variable correctly
        className={`${geistSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {/* Pass the validated locale and fetched messages to the provider */}
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

