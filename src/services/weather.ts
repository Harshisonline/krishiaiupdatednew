/**
 * Represents the input required for fetching weather data.
 */
export interface WeatherInput {
  location: string; // e.g., "London", "New York, US", "75001" (zip code)
}

/**
 * Represents the weather data structure.
 */
export interface WeatherData {
  locationName: string;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string; // e.g., "Sunny", "Cloudy", "Rain"
  iconUrl?: string; // URL to an icon representing the weather condition
  humidity: number; // Percentage
  windSpeed: number; // km/h
  pressure: number; // mb
  uvIndex?: number;
  visibility?: number; // km
  sunrise?: string; // ISO 8601 format
  sunset?: string; // ISO 8601 format
  // Potentially add forecast data here as an array of daily/hourly forecasts
}

/**
 * Fetches weather data for a given location.
 * TODO: Replace this mock implementation with a real API call to a weather service.
 *
 * @param input - The location for which to fetch weather data.
 * @returns A promise that resolves to the weather data.
 */
export async function getWeatherData(input: WeatherInput): Promise<WeatherData> {
  console.log(`Fetching weather data for: ${input.location}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // **MOCK IMPLEMENTATION**
  // In a real application, you would call a weather API here.
  // Example: OpenWeatherMap, WeatherAPI, AccuWeather, etc.

  // For now, return mock data based on a simple check.
  if (input.location.toLowerCase().includes("error")) {
    throw new Error("Mock API error: Could not fetch weather for this location.");
  }
  
  const mockData: WeatherData = {
    locationName: input.location.split(',')[0].trim(), // Simple parsing for display
    temperature: 25 + Math.floor(Math.random() * 10 - 5), // Random temp around 25C
    feelsLike: 24 + Math.floor(Math.random() * 10 - 5),
    condition: "Partly Cloudy",
    // Example icon from a service like OpenWeatherMap. Replace with actual logic.
    iconUrl: `https://picsum.photos/64/64?random=${Math.random()}`, // Placeholder image for icon
    humidity: 60 + Math.floor(Math.random() * 20 - 10),
    windSpeed: 15 + Math.floor(Math.random() * 10 - 5),
    pressure: 1012,
    uvIndex: 5,
    visibility: 10,
    sunrise: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Mock sunrise
    sunset: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Mock sunset
  };

  console.log("Mock weather data returned:", mockData);
  return mockData;
}
