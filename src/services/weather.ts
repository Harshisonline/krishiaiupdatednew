import type { WeatherRecommendationInput, WeatherRecommendationOutput } from '@/ai/flows/weather-recommendation';
import { getWeatherWithRecommendations as getWeatherWithRecommendationsFlow } from '@/ai/flows/weather-recommendation';

/**
 * Represents the input required for fetching weather data.
 * This type aligns with the input schema of the Genkit flow.
 */
export type WeatherInput = WeatherRecommendationInput;

/**
 * Represents the weather data structure, including farmer recommendations.
 * This type aligns with the output schema of the Genkit flow.
 */
export type WeatherData = WeatherRecommendationOutput;

/**
 * Fetches weather data and farmer-specific recommendations for a given location using a Genkit AI flow.
 *
 * @param input - The location for which to fetch weather data.
 * @returns A promise that resolves to the weather data and recommendations.
 */
export async function getWeatherData(input: WeatherInput): Promise<WeatherData> {
  console.log(`[Service:getWeatherData] Requesting weather and recommendations for: ${input.location}`);
  
  try {
    const result = await getWeatherWithRecommendationsFlow(input);
    console.log("[Service:getWeatherData] Weather data and recommendations received:", result);
    // The result from the flow should already match the WeatherData type.
    return result;
  } catch (error) {
    console.error('[Service:getWeatherData] Error calling getWeatherWithRecommendationsFlow:', error);
    // Fallback or re-throw, depending on desired error handling strategy.
    // For now, re-throwing to let the UI handle it with a toast.
    throw new Error(`Failed to fetch weather data and recommendations: ${error instanceof Error ? error.message : String(error)}`);
  }
}
