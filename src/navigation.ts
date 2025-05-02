import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, localePrefix} from './i18n'; // Remove pathnames import

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales, localePrefix}); // Remove pathnames config