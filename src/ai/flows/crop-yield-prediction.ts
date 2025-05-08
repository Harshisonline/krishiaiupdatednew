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

// Input schema remains the same as it defines the data structure expected by the service/API.
const PredictCropYieldInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Wheat, Corn, Rice).'),
  location: z.string().describe('The geographical location (e.g., Central Valley, CA, Punjab, India).'),
  plantingDate: z.string().describe("The date the crop was planted, in 'yyyy-MM-dd' format."),
  season: z.string().describe('The agricultural season (e.g., Kharif, Rabi, Zaid, Whole Year).'),
  landAreaHectares: z.number().min(0.01).describe('The area of the land in hectares (e.g., 2.5).'),
});
export type PredictCropYieldInput = z.infer<typeof PredictCropYieldInputSchema>;

// Output schema remains the same as it defines the data structure expected from the service/API.
const PredictCropYieldOutputSchema = z.object({
  predictedYieldKgPerHa: z.number().describe('The predicted crop yield in kilograms per hectare (kg/ha).'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score for the prediction (0.0 to 1.0).').optional(),
  factorsConsidered: z.array(z.string()).describe('A list of key factors the model considered for the prediction.').optional(),
  potentialRisks: z.array(z.string()).describe('Potential risks that might affect the yield.').optional(),
});
export type PredictCropYieldOutput = z.infer<typeof PredictCropYieldOutputSchema>;

/**
 * Predicts crop yield by calling an external API via the service layer.
 * No AI model/Genkit flow is used here for the prediction itself.
 *
 * @param input - The data required for crop yield prediction.
 * @returns A promise that resolves to the prediction output from the external API.
 */
export async function predictCropYield(input: PredictCropYieldInput): Promise<PredictCropYieldOutput> {
  // Validate input against the schema if needed, though the service might do this.
  // For now, directly pass it to the service.
  try {
    const result = await predictCropYieldService(input);
    // The service already returns PredictCropYieldOutput, so we can return it directly.
    return result;
  } catch (error) {
    console.error('Error in predictCropYield flow calling service:', error);
    // Re-throw the error to be handled by the calling UI component (e.g., display a toast)
    if (error instanceof Error) {
      throw new Error(`Crop yield prediction service failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during crop yield prediction.');
  }
}
