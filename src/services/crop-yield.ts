import type { PredictCropYieldInput, PredictCropYieldOutput } from '@/ai/flows/crop-yield-prediction';

/**
 * Represents the data required for crop yield prediction.
 * This type aligns with the input schema previously used by the Genkit flow.
 */
export type CropPredictionInput = PredictCropYieldInput;

/**
 * Represents the predicted crop yield and related information.
 * This type aligns with the output schema previously used by the Genkit flow.
 * Note: predictedYieldKgPerHa is the yield in kg per hectare.
 */
export type CropPredictionOutput = PredictCropYieldOutput;


/**
 * Asynchronously predicts the crop yield based on the provided data by calling an external API.
 *
 * @param cropData The data required for crop yield prediction.
 * @returns A promise that resolves to a CropPredictionOutput object containing the predicted yield (kg/ha) and other details.
 */
export async function predictCropYield(cropData: CropPredictionInput): Promise<CropPredictionOutput> {
  console.log('Requesting yield prediction from external API for:', cropData);
  const apiUrl = "https://supplies-recycling-appear-vintage.trycloudflare.com/predict";

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cropData),
    });

    if (!response.ok) {
      let errorBody = 'No additional error information available.';
      try {
        errorBody = await response.text();
      } catch (e) {
        console.warn('Could not read error body:', e);
      }
      console.error(`Error from API: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody || response.statusText}`);
    }

    const result: CropPredictionOutput = await response.json();
    console.log('Yield prediction result from external API:', result);
    return result;
  } catch (error) {
    console.error('Error calling external crop yield API:', error);
    // Re-throw to let the UI handle it with a toast.
    throw new Error(`Failed to predict crop yield via external API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

