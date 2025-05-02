
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'es'];
export const localePrefix = 'always'; // Default

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid early
  if (!locales.includes(locale as any)) {
    console.error(`Invalid locale detected in getRequestConfig: ${locale}`);
    notFound();
  }

  let messages;
  try {
    // Load the messages for the validated locale using absolute path alias
    messages = (await import(`@/messages/${locale}.json`)).default;
    if (!messages) {
      throw new Error(`Messages file is empty or invalid for locale: ${locale}`);
    }
  } catch (error) {
      console.error(`Failed to load messages for locale "${locale}":`, error);
      // Trigger 404 if messages cannot be loaded
      notFound();
  }


  return {
    messages: messages
  };
});
