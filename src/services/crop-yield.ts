
import type { PredictCropYieldInput, PredictCropYieldOutput } from '@/ai/flows/crop-yield-prediction';

/**
 * Represents the data required for crop yield prediction.
 * This type aligns with the input schema now used by the simplified flow.
 */
export type CropPredictionInput = PredictCropYieldInput;

/**
 * Represents the predicted crop yield and related information.
 * This type aligns with the output schema now used by the simplified flow.
 */
export type CropPredictionOutput = PredictCropYieldOutput;


/**
 * Asynchronously predicts the crop yield based on the provided data by calling an external API.
 *
 * @param cropData The data required for crop yield prediction.
 * @returns A promise that resolves to a CropPredictionOutput object containing the predicted yield and other details.
 */
export async function predictCropYield(cropData: CropPredictionInput): Promise<CropPredictionOutput> {
  console.log('Requesting yield prediction from external API for:', cropData);
  const apiUrl = "https://mental-hopkins-armor-feb.trycloudflare.com/predict";

  // The backend expects field names: crop, state, season, area
  // CropData already has these field names as per PredictCropYieldInput
  const requestBody = {
    crop: cropData.crop,
    state: cropData.state,
    season: cropData.season,
    area: cropData.area,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorBody = 'No additional error information available.';
      try {
        errorBody = await response.text();
      } catch (e) {
        console.warn('Could not read error body while handling API error:', e);
      }
      console.error(`Error from API: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody || response.statusText}`);
    }

    // Expecting response: {"predicted_production": number}
    const result: CropPredictionOutput = await response.json();
    console.log('Yield prediction result from external API:', result);

    if (typeof result.predicted_production !== 'number') {
        throw new Error('Invalid response format from API: "predicted_production" is missing or not a number.');
    }
    return result;
  } catch (error) {
    console.error('Error calling external crop yield API:', error);
    if (error instanceof Error && (error.message.startsWith('API request failed') || error.message.startsWith('Invalid response format'))) {
        throw error;
    }
    throw new Error(`Failed to get crop yield prediction from the external service. Please try again. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}
