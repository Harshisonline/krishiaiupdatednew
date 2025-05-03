'use client';

import { useEffect } from 'react';
import { Languages } from 'lucide-react'; // Import an icon
import { cn } from '@/lib/utils'; // Import cn utility

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (options: {
          pageLanguage: string;
          autoDisplay: boolean;
          layout?: any;
        }, elementId: string) => any;
      };
    };
  }
}


export default function GoogleTranslateWidget() {
  useEffect(() => {
    const initializeTranslateElement = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en', // Your site's default language
            autoDisplay: false, // Don't automatically display the banner
            layout: (window.google.translate.TranslateElement as any)?.InlineLayout?.SIMPLE,
          },
          'google_translate_element' // The ID of the div container
        );
         // Attempt to style the iframe select after initialization - might be brittle
         const selectElement = document.querySelector('.goog-te-combo');
         if (selectElement) {
           selectElement.classList.add('border', 'border-input', 'bg-background', 'text-foreground', 'rounded-md', 'py-1', 'px-2', 'h-8', 'text-sm');
         }

      } else {
         console.warn("Google Translate script not loaded yet. Retrying...");
         setTimeout(initializeTranslateElement, 500); // Retry after delay
      }
    };

     if (!window.googleTranslateElementInit) {
       window.googleTranslateElementInit = initializeTranslateElement;
     }


     if (document.getElementById('google_translate_element') && !window.google?.translate) {
         initializeTranslateElement();
     } else if (window.google?.translate?.TranslateElement) {
        // If script loaded but element not initialized yet (e.g., due to fast navigation)
        initializeTranslateElement();
     }


    return () => {
        // Cleanup function might be needed if issues arise
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    // Wrapper div for styling and positioning
    <div className="container mx-auto px-4 pt-4 flex justify-end items-center gap-2">
       {/* Custom Icon */}
       <Languages className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      {/* This div is where the Google Translate widget will be rendered. */}
      {/* We target this div for styling overrides, though internal widget styles are hard to change. */}
      <div id="google_translate_element"></div>
    </div>
  );
}
