'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Import ShadCN button
import { Languages } from 'lucide-react'; // Import a suitable icon

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
            // Apply custom styling via CSS in globals.css to hide original elements
            layout: (window.google.translate.TranslateElement as any).InlineLayout.SIMPLE,
          },
          'google_translate_element' // The ID of the hidden container div
        );
      } else {
        console.error("Google Translate script loaded, but 'google.translate' not available yet.");
        // Optionally retry initialization after a short delay
        // setTimeout(window.googleTranslateElementInit, 500);
      }
    };

    // If the script might have already loaded, try calling init immediately
    if (document.getElementById('google_translate_element') && !document.querySelector('#google_translate_element .goog-te-combo')) {
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

  // Function to trigger the Google Translate dropdown when the custom button is clicked
  const triggerTranslateDropdown = () => {
    const translateElement = document.getElementById('google_translate_element');
    const selectElement = translateElement?.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElement) {
      // Programmatically opening the select dropdown is tricky and often blocked by browsers.
      // Instead, we rely on the user clicking the select element naturally after it appears.
      // We can bring focus to it as a hint.
      // A better UX might involve custom dropdown UI interacting with the API, but that's complex.
      selectElement.focus(); // Bring focus to the hidden select
       // Attempt to style the dropdown - this might still be limited
       const widgetFrame = document.querySelector('.goog-te-menu-frame') as HTMLIFrameElement;
       if (widgetFrame?.contentDocument?.body) {
           widgetFrame.contentDocument.body.style.backgroundColor = 'hsl(var(--popover))';
           // Add more styling attempts here if needed
       }

    } else {
        console.warn("Google Translate select element not found.");
    }
  };


  return (
    // Container for positioning
     <div className="container mx-auto px-4 pt-4 text-right relative">
        {/* Custom Button Trigger */}
        <Button
            variant="outline"
            size="icon"
            onClick={triggerTranslateDropdown}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full shadow"
            aria-label="Select language"
            title="Translate this page"
        >
             <Languages className="h-5 w-5" />
        </Button>

        {/* Hidden container for the actual Google Translate widget */}
        {/* Style it to be visually hidden but accessible */}
        <div
            id="google_translate_element"
            className="absolute top-0 right-4 opacity-0 pointer-events-none"
            style={{ zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }} // Ensure it's completely out of sight and interaction flow
            aria-hidden="true"
        >
             {/* The Google Translate widget will render inside this div */}
        </div>
    </div>

  );
}
