import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl'; // Removed unused useTranslations
import { locales } from '../../../i18n'; // Adjust path if needed
import LanguageSwitcher from '@/components/LanguageSwitcher'; // Import LanguageSwitcher

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Function to generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // Load messages for the current locale
  // Note: Adjust the path based on your project structure
  let messages;
  try {
     messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    notFound(); // Trigger 404 if messages can't be loaded
  }

  const t = (key: string) => messages.Metadata?.[key] || key; // Simple translation helper

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
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = useMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
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
