'use server';
/**
 * @fileOverview A crop disease diagnosis agent using an external API.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process by calling an external API.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {z} from 'genkit';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

// Schema to hold the raw response from the backend API
const DiagnoseCropDiseaseOutputSchema = z.object({
  api_response: z.any().describe("The raw JSON response from the backend disease prediction API."),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

const API_URL = "https://investing-continuously-calculator-emerald.trycloudflare.com/predict";

// Helper function to convert data URI to Blob and guess filename
function dataURItoBlobWithFilename(dataURI: string): { blob: Blob, filename: string } {
  const parts = dataURI.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URI format');
  }
  const meta = parts[0];
  const data = parts[1];
  
  const mimeStringParts = meta.split(':')[1]?.split(';');
  if (!mimeStringParts || mimeStringParts.length === 0) {
    throw new Error('Invalid data URI format: MIME type not found');
  }
  const mimeString = mimeStringParts[0];
  
  let byteString;
  try {
    byteString = atob(data);
  } catch (e) {
    throw new Error('Invalid base64 data in URI');
  }
  
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  // Guess extension
  let extension = 'bin';
  if (mimeString === 'image/jpeg') extension = 'jpg';
  else if (mimeString === 'image/png') extension = 'png';
  else if (mimeString === 'image/webp') extension = 'webp';
  else if (mimeString === 'image/gif') extension = 'gif';
  // Add more MIME types and corresponding extensions as needed

  const filename = `crop_image.${extension}`;
  
  return { blob, filename };
}


export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  console.log('[diagnoseCropDisease] Calling external API for disease diagnosis.');
  try {
    const { blob, filename } = dataURItoBlobWithFilename(input.photoDataUri);
    const formData = new FormData();
    // The backend likely expects a file field, common names are 'file', 'image'.
    // The error "No file uploaded" suggests it's looking for a field of type file.
    formData.append('file', blob, filename); 

    const response = await fetch(API_URL, {
      method: 'POST',
      // Do NOT set Content-Type header manually when using FormData,
      // the browser/fetch API will set it correctly with the multipart boundary.
      body: formData,
    });

    if (!response.ok) {
      let errorBody = 'No additional error information from API.';
      try {
        // Try to parse as JSON first, as the error response provided was JSON
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson);
      } catch (e) {
        // If not JSON, try as text
        try {
            errorBody = await response.text();
        } catch (e_text) {
            // ignore if error body cannot be read
            console.warn('[diagnoseCropDisease] Could not read error body as JSON or text.');
        }
      }
      console.error(`[diagnoseCropDisease] API request failed: ${response.status} ${response.statusText}`, errorBody);
      // Construct a more informative error message including the API's response if available
      throw new Error(`API request failed with status ${response.status}: ${errorBody || response.statusText}`);
    }

    const resultJson = await response.json();
    console.log('[diagnoseCropDisease] API response received:', resultJson);
    
    return { api_response: resultJson };

  } catch (error) {
    console.error('[diagnoseCropDisease] Error calling external API:', error);
    if (error instanceof Error) {
      // Check if the error message already indicates an API failure to avoid double-prefixing
      if (error.message.startsWith('API request failed with status') || error.message.startsWith('Invalid data URI format') || error.message.startsWith('Invalid base64 data in URI')) {
          throw error; // Re-throw the specific error from fetch or dataURItoBlobWithFilename
      }
      throw new Error(`Failed to diagnose crop disease via external API: ${error.message}`);
    }
    throw new Error('An unknown error occurred during crop disease diagnosis via external API.');
  }
}
