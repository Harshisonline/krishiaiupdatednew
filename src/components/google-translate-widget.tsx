
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (options: {
          pageLanguage: string;
          autoDisplay: boolean;
          layout: any; // Adjust type if needed, using any for simplicity
        }, elementId: string) => any; // Adjust type if needed
      };
    };
  }
}


export default function GoogleTranslateWidget() {
  useEffect(() => {
    // Define the initialization function globally
    window.googleTranslateElementInit = () => {
      // Check if google.translate is available before initializing
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en', // Your site's default language
            autoDisplay: false,
            // Using SIMPLE layout to minimize intrusion initially
            layout: (window.google.translate.TranslateElement as any).InlineLayout.SIMPLE,
          },
          'google_translate_element' // The ID of the container div
        );
      } else {
        console.error("Google Translate script loaded, but 'google.translate' not available yet.");
        // Optionally retry initialization after a short delay
        // setTimeout(window.googleTranslateElementInit, 500);
      }
    };

    // If the script might have already loaded, try calling init immediately
    if (document.getElementById('google_translate_element') && !document.querySelector('.goog-te-gadget')) {
       // Check if already initialized
       if (typeof window.googleTranslateElementInit === 'function') {
         window.googleTranslateElementInit();
       }
    }

    // Cleanup function (optional, might not be necessary for this script)
    // return () => {
    //   delete window.googleTranslateElementInit;
    // };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    // This div will be targeted by the Google Translate widget
    // Apply positioning and button-like styles here
    <div className="container mx-auto px-4 pt-4 text-right"> {/* Position container */}
        <div
            id="google_translate_element"
            className="inline-block p-2 bg-secondary text-secondary-foreground rounded-md shadow hover:bg-secondary/90 cursor-pointer transition-colors"
            aria-label="Select language"
            title="Translate this page"
        >
            {/* The Google Translate widget will render inside this div */}
            {/* Applying styles here makes the container look like a button area */}
        </div>
    </div>

  );
}

