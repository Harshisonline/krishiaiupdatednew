'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void; // Make optional as it might be deleted
    google?: {
      translate?: {
        TranslateElement: new (options: {
          pageLanguage: string;
          autoDisplay: boolean;
          layout?: any; // Use specific type if known, e.g., google.translate.TranslateElement.InlineLayout.SIMPLE
        }, elementId: string) => any; // Adjust type if needed
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
            // Optionally customize layout, e.g., SIMPLE
            layout: (window.google.translate.TranslateElement as any)?.InlineLayout?.SIMPLE,
          },
          'google_translate_element' // The ID of the div container
        );
      } else {
         console.warn("Google Translate script not loaded yet. Retrying...");
         setTimeout(initializeTranslateElement, 500); // Retry after delay
      }
    };

    // Define the initialization function globally ONLY IF it doesn't exist
     if (!window.googleTranslateElementInit) {
       window.googleTranslateElementInit = initializeTranslateElement;
     }


    // Trigger initialization if the script might have already loaded
     if (document.getElementById('google_translate_element') && !window.google?.translate) {
         initializeTranslateElement();
     }

    // Cleanup function (optional but good practice)
    return () => {
        // If you need to clean up anything related to the widget, do it here.
        // Removing the global function might be risky if other scripts depend on it.
        // delete window.googleTranslateElementInit;
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    // This div is where the Google Translate widget will be rendered.
    // Style it or position it as needed using Tailwind classes.
    // Example: position it top-right
    <div className="container mx-auto px-4 pt-4 text-right">
        <div id="google_translate_element"></div>
    </div>
  );
}
