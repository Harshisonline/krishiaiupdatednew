
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '../../../i18n'; // Adjust path if needed
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Initialize font using the standard documented way
const geistSans = GeistSans; // Use the imported object directly

// Function to generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // Validate locale first
  if (!locales.includes(locale)) {
     console.error(`[generateMetadata] Invalid locale detected: ${locale}`);
    notFound();
  }

  // Load messages for the current locale
  let messages;
  try {
     // Use absolute path alias
     messages = (await import(`@/messages/${locale}.json`)).default;
     if (!messages || !messages.Metadata) {
       // Ensure Metadata key exists
       console.warn(`Metadata section missing or empty in messages/${locale}.json`);
       // Provide default metadata or handle as needed
       return {
         title: 'KrishiAi+',
         description: 'Smart Farming Platform',
       };
     }
  } catch (error) {
    console.error(`[generateMetadata] Could not load or parse messages for locale: ${locale}`, error);
    // Provide default metadata on error
     return {
         title: 'KrishiAi+ (Error)',
         description: 'Error loading configuration.',
       };
  }

  // Safe access to metadata assuming messages and messages.Metadata exist after checks/defaults
  const t = (key: string) => messages?.Metadata?.[key] || `Missing Metadata.${key}`;

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


// Make the RootLayout component async to fetch messages
export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale robustly first
  if (!locales.includes(locale)) {
     console.error(`Invalid locale detected in RootLayout render: ${locale}`);
    notFound();
  }

  // Fetch messages server-side directly after validation
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
    if (!messages) {
      throw new Error(`Messages file is empty or invalid for locale: ${locale}`);
    }
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}" in layout:`, error);
    notFound(); // Throw 404 if messages cannot be loaded
  }

  // DO NOT call useMessages() here. It's for Client Components.

  return (
    <html lang={locale}>
      <body
        // Apply font variable correctly using the imported object's variable property
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

