
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { locales } from '../../../i18n'; // Adjust path if needed
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Initialize font using the standard documented way
const geistSans = GeistSans; // Use the imported object directly

// Function to generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // Validate locale first
  if (!locales.includes(locale)) {
     console.error(`[generateMetadata] Invalid locale detected: ${locale}. Valid locales: ${locales.join(', ')}`);
    notFound();
  }
  console.log(`[generateMetadata] Generating metadata for locale: ${locale}`);

  // Load messages for the current locale
  let messages;
  try {
     // Add extra check and log right before import
     if (!locales.includes(locale)) {
       console.error(`[generateMetadata] CRITICAL: Invalid locale "${locale}" detected JUST BEFORE import! Valid locales: ${locales.join(', ')}. Triggering notFound().`);
       notFound(); // Safeguard
     }
     console.log(`[generateMetadata] Attempting to import messages for locale: ${locale}`);
     messages = (await import(`@/messages/${locale}.json`)).default;
     console.log(`[generateMetadata] Successfully imported messages for locale: ${locale}`);
     if (!messages || !messages.Metadata) {
       // Ensure Metadata key exists
       console.warn(`[generateMetadata] Metadata section missing or empty in messages/${locale}.json`);
       // Provide default metadata or handle as needed
       return {
         title: 'KrishiAi+',
         description: 'Smart Farming Platform',
       };
     }
  } catch (error) {
    console.error(`[generateMetadata] Could not load or parse messages for locale: ${locale}`, error);
    if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.error(`[generateMetadata] Import failed for locale "${locale}". File might be missing or the locale param is invalid.`);
    }
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
  // Ensure only valid locales are generated
  console.log('[generateStaticParams] Generating static params for locales:', locales);
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
  // Validate locale robustly FIRST - This is critical
  console.log(`[RootLayout] Received locale param: ${locale}`); // Log received locale
  if (!locales.includes(locale)) {
     console.error(`[RootLayout] Invalid locale detected early: "${locale}". Valid locales: ${locales.join(', ')}. Triggering notFound().`);
    notFound();
  }
  console.log(`[RootLayout] Locale "${locale}" passed initial validation.`); // Log validation success


  // Fetch messages server-side directly after validation
  let messages;
  try {
    // Add extra validation right before import as a safeguard
    if (!locales.includes(locale)) {
       console.error(`[RootLayout] CRITICAL: Invalid locale "${locale}" detected JUST BEFORE import! Valid locales: ${locales.join(', ')}. Triggering notFound().`);
       notFound(); // This shouldn't be reached if the first check works, but acts as a safeguard
    }
    console.log(`[RootLayout] Attempting to import messages for locale: ${locale}`);
    messages = (await import(`@/messages/${locale}.json`)).default;
    console.log(`[RootLayout] Successfully imported messages for locale: ${locale}`);

    if (!messages) {
       console.error(`[RootLayout] Messages file is empty or invalid for locale: ${locale}`);
      throw new Error(`Messages file is empty or invalid for locale: ${locale}`);
    }
  } catch (error) {
    console.error(`[RootLayout] Failed to load messages for locale "${locale}":`, error);
    // Log the specific error if it's the import failing
    if (error instanceof Error && error.message.includes('Cannot find module')) {
        // This is the likely cause of the 'unknown' module error if locale is invalid
        console.error(`[RootLayout] Import failed for locale "${locale}". This likely means the file doesn't exist OR the locale parameter itself was invalid (e.g., "unknown").`);
    }
    notFound(); // Throw 404 if messages cannot be loaded
  }


  // Pass the validated locale and fetched messages to the provider
  return (
    <html lang={locale}>
      <body
        // Apply font variable correctly using the imported object's variable property
        className={`${geistSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
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
