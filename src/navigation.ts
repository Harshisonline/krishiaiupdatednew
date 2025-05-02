import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, pathnames, localePrefix} from './i18n'; // Import pathnames

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales, localePrefix, pathnames}); // Add pathnames config