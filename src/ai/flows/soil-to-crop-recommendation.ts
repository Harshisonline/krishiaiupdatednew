'use server';
/**
 * @fileOverview Recommends crops based on soil analysis from an image by calling an external API.
 *
 * - recommendCrops - A function that handles the crop recommendation process.
 * - RecommendCropsInput - The input type for the recommendCrops function.
 * - RecommendCropsOutput - The return type for the recommendCrops function.
 */

import {z} from 'genkit';

const RecommendCropsInputSchema = z.object({
  soilPhotoDataUri: z
    .string()
    .describe(
      "A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

// Schema for the direct API response structure based on new format
const ApiSoilResponseSchema = z.object({
    soil_type: z.string().describe('The type of soil detected by the API.'),
    recommended_crop: z.string().optional().describe('The single crop recommended by the API for the detected soil type.')
});

// Schema for the output structure expected by the frontend
const RecommendCropsOutputSchema = z.object({
  soilType: z.string().describe('The type of soil detected in the image.'),
  recommendedCrops: z
    .array(z.string())
    .describe('A list of crops recommended for the detected soil type.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

const API_URL = "https://ministers-dropped-particular-producer.trycloudflare.com//predict";

// Helper function to convert data URI to Blob and guess filename
// Copied from crop-disease-diagnosis.ts as it's a common utility for file uploads
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

  let extension = 'bin';
  if (mimeString === 'image/jpeg') extension = 'jpg';
  else if (mimeString === 'image/png') extension = 'png';
  else if (mimeString === 'image/webp') extension = 'webp';
  else if (mimeString === 'image/gif') extension = 'gif';

  const filename = `soil_image.${extension}`;
  
  return { blob, filename };
}

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  console.log('[recommendCrops] Calling external API for soil-to-crop recommendation.');
  try {
    const { blob, filename } = dataURItoBlobWithFilename(input.soilPhotoDataUri);
    const formData = new FormData();
    // The backend likely expects a file field named 'file' or 'image'.
    // Assuming 'file' based on common practice.
    formData.append('file', blob, filename); 

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header manually when using FormData,
      // the browser/fetch API will set it correctly with the multipart boundary.
    });

    if (!response.ok) {
      let errorBody = 'No additional error information from API.';
      try {
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson);
      } catch (e) {
        try {
            errorBody = await response.text();
        } catch (e_text) {
            console.warn('[recommendCrops] Could not read error body as JSON or text.');
        }
      }
      console.error(`[recommendCrops] API request failed: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody || response.statusText}`);
    }

    const apiResultRaw = await response.json();
    console.log('[recommendCrops] API response received:', apiResultRaw);

    // Validate and transform the API response
    const parsedApiResult = ApiSoilResponseSchema.safeParse(apiResultRaw);
    if (!parsedApiResult.success) {
        console.error('[recommendCrops] API response validation failed:', parsedApiResult.error.flatten());
        throw new Error(`Invalid response format from soil recommendation API: ${parsedApiResult.error.message}`);
    }
    
    // Map to the output schema expected by the frontend
    const recommendedCropsArray: string[] = [];
    if (parsedApiResult.data.recommended_crop) {
        recommendedCropsArray.push(parsedApiResult.data.recommended_crop);
    }

    return {
      soilType: parsedApiResult.data.soil_type,
      recommendedCrops: recommendedCropsArray,
    };

  } catch (error) {
    console.error('[recommendCrops] Error calling external API or processing response:', error);
    if (error instanceof Error) {
      if (error.message.startsWith('API request failed with status') || 
          error.message.startsWith('Invalid data URI format') || 
          error.message.startsWith('Invalid base64 data in URI') ||
          error.message.startsWith('Invalid response format from soil recommendation API')) {
          throw error; // Re-throw specific errors
      }
      throw new Error(`Failed to get soil recommendations via external API: ${error.message}`);
    }
    throw new Error('An unknown error occurred during soil-to-crop recommendation via external API.');
  }
}
