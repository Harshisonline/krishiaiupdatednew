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

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  console.log('[diagnoseCropDisease] Calling external API for disease diagnosis.');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoDataUri: input.photoDataUri }), // Assuming API expects this field name
    });

    if (!response.ok) {
      let errorBody = 'No additional error information from API.';
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore if error body cannot be read
      }
      console.error(`[diagnoseCropDisease] API request failed: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const resultJson = await response.json();
    console.log('[diagnoseCropDisease] API response received:', resultJson);
    
    return { api_response: resultJson };

  } catch (error) {
    console.error('[diagnoseCropDisease] Error calling external API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to diagnose crop disease via external API: ${error.message}`);
    }
    throw new Error('An unknown error occurred during crop disease diagnosis via external API.');
  }
}
