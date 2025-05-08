'use server';
/**
 * @fileOverview A crop yield prediction AI agent.
 *
 * - predictCropYield - A function that handles the crop yield prediction process.
 * - PredictCropYieldInput - The input type for the predictCropYield function.
 * - PredictCropYieldOutput - The return type for the predictCropYield function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PredictCropYieldInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Wheat, Corn, Rice).'),
  location: z.string().describe('The geographical location (e.g., Central Valley, CA, Punjab, India).'),
  plantingDate: z.string().describe("The date the crop was planted, in 'yyyy-MM-dd' format."),
  season: z.string().describe('The agricultural season (e.g., Kharif, Rabi, Zaid, Whole Year).'),
  landAreaHectares: z.number().min(0.01).describe('The area of the land in hectares (e.g., 2.5).'),
});
export type PredictCropYieldInput = z.infer<typeof PredictCropYieldInputSchema>;

const PredictCropYieldOutputSchema = z.object({
  predictedYieldKgPerHa: z.number().describe('The predicted crop yield in kilograms per hectare (kg/ha).'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score for the prediction (0.0 to 1.0).').optional(),
  factorsConsidered: z.array(z.string()).describe('A list of key factors the model considered for the prediction.').optional(),
  potentialRisks: z.array(z.string()).describe('Potential risks that might affect the yield.').optional(),
});
export type PredictCropYieldOutput = z.infer<typeof PredictCropYieldOutputSchema>;

export async function predictCropYield(input: PredictCropYieldInput): Promise<PredictCropYieldOutput> {
  return predictCropYieldGenkitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCropYieldPrompt',
  input: {schema: PredictCropYieldInputSchema},
  output: {schema: PredictCropYieldOutputSchema},
  prompt: `You are an advanced agricultural AI expert specializing in crop yield prediction.
Based on the following information, predict the crop yield in kilograms per hectare (kg/ha).

Crop Information:
- Crop Type: {{{cropType}}}
- Location: {{{location}}}
- Planting Date: {{{plantingDate}}}
- Season: {{{season}}}
- Land Area: {{{landAreaHectares}}} hectares

Provide your prediction for yield in kilograms per hectare (kg/ha) in the specified JSON format.
The output field 'predictedYieldKgPerHa' should represent this value.
Include a confidence score for your prediction (between 0.0 and 1.0).
List the key factors you considered in making this prediction.
Also, list any potential risks that could significantly alter this predicted yield.

Consider factors like typical climate for the location and season, general soil knowledge for the region,
common pests or diseases for the crop in that area, and typical yield ranges for the specified crop under normal conditions.
The land area provided might influence factors like management scale or microclimate variations, but the yield prediction should still be per hectare.
Do not ask for more information. Make the best prediction with the given details.
If the location is very general, assume typical conditions for that broader region.
The planting date and season help narrow down the growth cycle and environmental conditions.`,
});

const predictCropYieldGenkitFlow = ai.defineFlow(
  {
    name: 'predictCropYieldGenkitFlow',
    inputSchema: PredictCropYieldInputSchema,
    outputSchema: PredictCropYieldOutputSchema,
  },
  async (input: PredictCropYieldInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Crop yield prediction failed to return an output.');
    }
    // Ensure predictedYieldKgPerHa is a positive number, if not, set to a default or handle error.
    if (output.predictedYieldKgPerHa < 0) {
        // This could be an indication of a very poor yield or an error in prediction.
        // For now, let's log and allow it, but in a real app, might cap at 0 or re-evaluate.
        console.warn(`Predicted yield for ${input.cropType} at ${input.location} is negative: ${output.predictedYieldKgPerHa} kg/ha. This may indicate very unfavorable conditions or a prediction anomaly.`);
    }
    return output;
  }
);
```