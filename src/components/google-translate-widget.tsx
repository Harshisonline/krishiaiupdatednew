'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button'; // Import ShadCN button
import { Languages } from 'lucide-react'; // Import a suitable icon

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
  const initAttempted = useRef(false);

  useEffect(() => {
    const initializeTranslateElement = () => {
       console.log('[GoogleTranslateWidget] Attempting initialization...');
      if (window.google && window.google.translate) {
         console.log('[GoogleTranslateWidget] google.translate found. Initializing.');
         try {
            new window.google.translate.TranslateElement(
            {
                pageLanguage: 'en', // Your site's default language
                autoDisplay: false,
                // Using SIMPLE layout to minimize intrusion initially
                layout: (window.google.translate.TranslateElement as any)?.InlineLayout?.SIMPLE,
            },
            'google_translate_element' // The ID of the hidden container div
            );
            console.log('[GoogleTranslateWidget] Initialization successful.');
         } catch (error) {
             console.error('[GoogleTranslateWidget] Error initializing TranslateElement:', error);
         }

      } else {
        console.warn("[GoogleTranslateWidget] google.translate not available yet. Retrying...");
        // Retry initialization after a short delay if not available
         setTimeout(initializeTranslateElement, 500);
      }
    };

    // Define the initialization function globally ONLY IF it doesn't exist
     if (!window.googleTranslateElementInit) {
        console.log('[GoogleTranslateWidget] Defining window.googleTranslateElementInit');
        window.googleTranslateElementInit = () => {
           console.log('[GoogleTranslateWidget] googleTranslateElementInit callback executed.');
            initializeTranslateElement();
        };
     }


    // Trigger initialization if the script might have already loaded
    // and initialization hasn't been attempted via the callback yet.
     if (document.getElementById('google_translate_element') && !initAttempted.current) {
        console.log('[GoogleTranslateWidget] Element exists, potentially calling init directly.');
        if (typeof window.googleTranslateElementInit === 'function') {
             // Ensure it doesn't run multiple times if called directly and via callback
            if (!initAttempted.current) {
                initAttempted.current = true;
                 console.log('[GoogleTranslateWidget] Calling googleTranslateElementInit directly.');
                window.googleTranslateElementInit();
            }
        } else {
             console.warn('[GoogleTranslateWidget] googleTranslateElementInit function not found when checking directly.');
        }
    }

    // Cleanup function: Remove the global callback function when the component unmounts
    // This helps prevent potential issues if the component is mounted/unmounted multiple times.
    return () => {
        console.log('[GoogleTranslateWidget] Cleaning up: removing googleTranslateElementInit');
        // Only delete if it's the one we defined
        // Note: This might be overly cautious and could interfere if other scripts rely on it.
        // Consider removing this cleanup if it causes issues.
         if (window.googleTranslateElementInit?.toString().includes("initializeTranslateElement")) {
             delete window.googleTranslateElementInit;
         }

    };
  }, []); // Empty dependency array ensures this runs once on mount


  const triggerTranslateDropdown = () => {
    const translateElement = document.getElementById('google_translate_element');
    const selectElement = translateElement?.querySelector('.goog-te-combo') as HTMLSelectElement | null;

     console.log('[GoogleTranslateWidget] Trigger button clicked.');
     console.log('[GoogleTranslateWidget] Translate Element:', translateElement);
     console.log('[GoogleTranslateWidget] Select Element (.goog-te-combo):', selectElement);


    if (selectElement) {
        console.log('[GoogleTranslateWidget] Select element found. Focusing.');
      // Programmatically opening the select dropdown is blocked by browsers.
      // Focusing it is the most reliable cross-browser approach.
      selectElement.focus();

       // Attempt to style the dropdown iframe after focus (might still be limited)
       setTimeout(() => {
           const widgetFrame = document.querySelector('iframe.goog-te-menu-frame');
           console.log('[GoogleTranslateWidget] Dropdown iframe:', widgetFrame);
            if (widgetFrame instanceof HTMLIFrameElement && widgetFrame.contentDocument?.body) {
                 console.log('[GoogleTranslateWidget] Styling dropdown iframe.');
                // Apply styles directly - use !important cautiously if needed
                 widgetFrame.style.backgroundColor = 'hsl(var(--popover))'; // Example style
                 // widgetFrame.contentDocument.body.style.backgroundColor = 'hsl(var(--popover))'; // Alternative
            } else {
                 console.log('[GoogleTranslateWidget] Could not access dropdown iframe content.');
            }
       }, 100); // Short delay to allow iframe to potentially render

    } else {
        console.warn("[GoogleTranslateWidget] Google Translate select element (.goog-te-combo) not found. Trigger failed.");
        // Attempt re-initialization if the element is missing, maybe it failed first time
        if (typeof window.googleTranslateElementInit === 'function' && !initAttempted.current) {
             console.log("[GoogleTranslateWidget] Retrying initialization on trigger click.");
             initAttempted.current = true;
             window.googleTranslateElementInit();
             // Inform user to try again after a moment
             alert("Translate widget is initializing. Please try clicking the button again in a moment.");
        } else {
             alert("Could not activate translation widget. Please ensure Google Translate is not blocked and try reloading the page.");
        }
    }
  };


  return (
    // Container for positioning
     <div className="container mx-auto px-4 pt-4 text-right relative z-50"> {/* Increased z-index */}
        {/* Custom Button Trigger */}
        <Button
            variant="outline"
            size="icon"
            onClick={triggerTranslateDropdown}
            className="bg-card hover:bg-accent hover:text-accent-foreground border border-input rounded-full shadow-md" // Adjusted styling for visibility
            aria-label="Select language"
            title="Translate this page"
        >
             <Languages className="h-5 w-5" />
        </Button>

        {/* Hidden container for the actual Google Translate widget */}
        {/* Style it to be visually hidden but accessible */}
         {/* IMPORTANT: Ensure this div exists in the DOM when the script runs */}
        <div
            id="google_translate_element"
            // Apply styles to visually hide but keep accessible for the script
            className="absolute top-0 right-4 opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
             style={{ zIndex: -1 }} // Ensure it's behind other elements
            aria-hidden="true"
        >
             {/* The Google Translate widget will render inside this div */}
             {/* Adding placeholder text can sometimes help debug if the div itself is missing */}
             {/* Google Translate Element Placeholder */}
        </div>
    </div>

  );
}
