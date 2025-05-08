'use server';
/**
 * @fileOverview A crop yield prediction agent that uses an external API.
 *
 * - predictCropYield - A function that handles the crop yield prediction process by calling an external API.
 * - PredictCropYieldInput - The input type for the predictCropYield function.
 * - PredictCropYieldOutput - The return type for the predictCropYield function.
 */

import { z } from 'genkit';
import { predictCropYield as predictCropYieldService } from '@/services/crop-yield';

// Updated input schema to match backend expectations
const PredictCropYieldInputSchema = z.object({
  crop: z.string().describe('The type of crop (e.g., Wheat, Corn, Rice).'),
  state: z.string().describe('The state/region where the crop is grown (e.g., California, Punjab).'),
  season: z.string().describe('The agricultural season (e.g., Kharif, Rabi, Zaid, Whole Year).'),
  area: z.number().min(0.01).describe('The area of the land in hectares (e.g., 2.5).'),
});
export type PredictCropYieldInput = z.infer<typeof PredictCropYieldInputSchema>;

// Updated output schema to match backend response
const PredictCropYieldOutputSchema = z.object({
  predicted_production: z.number().describe('The predicted crop production in relevant units (e.g., kg).'),
});
export type PredictCropYieldOutput = z.infer<typeof PredictCropYieldOutputSchema>;

/**
 * Predicts crop yield by calling an external API via the service layer.
 *
 * @param input - The data required for crop yield prediction.
 * @returns A promise that resolves to the prediction output from the external API.
 */
export async function predictCropYield(input: PredictCropYieldInput): Promise<PredictCropYieldOutput> {
  try {
    const result = await predictCropYieldService(input);
    return result;
  } catch (error) {
    console.error('Error in predictCropYield flow calling service:', error);
    if (error instanceof Error) {
      throw new Error(`Crop yield prediction service failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during crop yield prediction.');
  }
}
