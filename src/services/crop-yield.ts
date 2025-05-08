import type { PredictCropYieldInput, PredictCropYieldOutput } from '@/ai/flows/crop-yield-prediction';
import { predictCropYield as predictCropYieldFlow } from '@/ai/flows/crop-yield-prediction';

/**
 * Represents the data required for crop yield prediction.
 * This type aligns with the input schema of the Genkit flow.
 */
export type CropPredictionInput = PredictCropYieldInput;

/**
 * Represents the predicted crop yield and related information.
 * This type aligns with the output schema of the Genkit flow.
 * Note: predictedYieldKgPerHa is the yield in kg per hectare.
 */
export type CropPredictionOutput = PredictCropYieldOutput;


/**
 * Asynchronously predicts the crop yield based on the provided data using a Genkit AI flow.
 *
 * @param cropData The data required for crop yield prediction.
 * @returns A promise that resolves to a CropPredictionOutput object containing the predicted yield (kg/ha) and other details.
 */
export async function predictCropYield(cropData: CropPredictionInput): Promise<CropPredictionOutput> {
  console.log('Requesting yield prediction for:', cropData);
  try {
    const result = await predictCropYieldFlow(cropData);
    console.log('Yield prediction result:', result);
    return result;
  } catch (error) {
    console.error('Error calling predictCropYieldFlow:', error);
    // Fallback or re-throw, depending on desired error handling strategy
    // For now, re-throwing to let the UI handle it.
    throw new Error(`Failed to predict crop yield: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```