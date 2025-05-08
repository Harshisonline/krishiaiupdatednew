'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Cloud, Sun, Thermometer, Wind, Droplets, CloudSun } from 'lucide-react'; // Added CloudSun
import { getWeatherData, type WeatherData, type WeatherInput } from '@/services/weather';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';


const pageStrings = {
  title: "Weather Forecast",
  description: "Enter a location to get the current weather conditions and forecast.",
  locationLabel: "Location",
  locationPlaceholder: "e.g., New York, London, Tokyo",
  getWeatherButton: "Get Weather",
  fetchingWeatherButton: "Fetching Weather...",
  backToHome: "Back to Home",
  weatherApiNotIntegrated: "Weather API is not yet integrated. Displaying mock data.",
  errorFetchingWeather: "Failed to fetch weather data. Please try again later.",
  currentWeatherTitle: "Current Weather in {location}",
  temperature: "Temperature",
  feelsLike: "Feels Like",
  condition: "Condition",
  humidity: "Humidity",
  windSpeed: "Wind Speed",
  enterLocationPrompt: "Please enter a location to see the weather forecast.",
};

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const WeatherDisplay: FC<{ data: WeatherData; location: string }> = ({ data, location }) => {
  return (
    <Card className="mt-6 bg-secondary text-secondary-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          {data.iconUrl ? (
            <Image src={data.iconUrl} alt={data.condition} width={32} height={32} data-ai-hint="weather condition" />
          ) : (
            <CloudSun className="h-6 w-6" />
          )}
          {pageStrings.currentWeatherTitle.replace('{location}', location)}
        </CardTitle>
        <CardDescription>{data.condition}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{pageStrings.temperature}</p>
            <p className="text-lg font-semibold">{data.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{pageStrings.feelsLike}</p>
            <p className="text-lg font-semibold">{data.feelsLike}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{pageStrings.humidity}</p>
            <p className="text-lg font-semibold">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{pageStrings.windSpeed}</p>
            <p className="text-lg font-semibold">{data.windSpeed} km/h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const WeatherPage: FC = () => {
  const [location, setLocation] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Temporary: Show a toast message that API is not integrated yet
  useEffect(() => {
    toast({
      title: "Under Development",
      description: pageStrings.weatherApiNotIntegrated,
      variant: "default",
      duration: 5000,
    });
  }, [toast]);


  const handleFetchWeather = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: pageStrings.enterLocationPrompt,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const data = await getWeatherData({ location });
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      const errorMessage = err instanceof Error ? err.message : pageStrings.errorFetchingWeather;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        {pageStrings.backToHome}
      </Link>
      <Card className="w-full shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{pageStrings.title}</CardTitle>
          <CardDescription>{pageStrings.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="location-input">{pageStrings.locationLabel}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="location-input"
                  type="text"
                  placeholder={pageStrings.locationPlaceholder}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-grow"
                  onKeyPress={(e) => e.key === 'Enter' && handleFetchWeather()}
                />
                <Button onClick={handleFetchWeather} disabled={loading || !location.trim()}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? pageStrings.fetchingWeatherButton : pageStrings.getWeatherButton}
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner />}
            
            {weatherData && !loading && <WeatherDisplay data={weatherData} location={location} />}

            {!loading && !weatherData && !error && (
               <Alert className="mt-6 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <CloudSun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle>Ready to check the weather?</AlertTitle>
                <AlertDescription>{pageStrings.enterLocationPrompt}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherPage;
