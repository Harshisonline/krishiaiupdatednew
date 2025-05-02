'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { locales } from '../../i18n'; // Adjust path if needed

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (newLocale: string) => {
    // Remove the current locale prefix from the pathname
    const currentPathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.substring(`/${locale}`.length) || '/'
      : pathname;

    // Construct the new path with the new locale prefix
    const newPath = `/${newLocale}${currentPathWithoutLocale}`;

    router.replace(newPath);
  };

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc === 'en' ? 'English' : 'Español'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
