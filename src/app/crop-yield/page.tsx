'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { predictCropYield, type PredictCropYieldOutput, type PredictCropYieldInput } from '@/ai/flows/crop-yield-prediction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep if used outside RHF Form
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, ArrowLeft, Info, AlertTriangleIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


// Hardcoded English Strings
const pageStrings = {
    title: "Crop Yield Prediction",
    description: "Enter your crop details to estimate the potential yield.",
    cropTypeLabel: "Crop Type",
    cropTypePlaceholder: "e.g., Wheat, Corn, Rice",
    locationLabel: "Location (City/Region, Country)",
    locationPlaceholder: "e.g., Central Valley, CA, USA",
    plantingDateLabel: "Planting Date",
    seasonLabel: "Season",
    seasonPlaceholder: "Select a season",
    landAreaLabel: "Land Area (Hectares)",
    landAreaPlaceholder: "e.g., 2.5",
    pickDate: "Pick a date",
    predictButton: "Predict Yield",
    predictingButton: "Predicting...",
    predictionFailedErrorTitle: "Prediction Failed",
    predictionFailedErrorDescription: "Failed to predict crop yield. Please check your input or try again later.",
    resultTitle: "Predicted Yield Analysis",
    predictedYieldLabel: "Estimated Yield:",
    resultUnit: "kg/ha",
    confidenceScoreLabel: "Confidence Score:",
    factorsConsideredLabel: "Factors Considered:",
    potentialRisksLabel: "Potential Risks:",
    backToHome: "Back to Home"
};

const seasonOptions = [
    { value: "Kharif", label: "Kharif (Monsoon/Summer)" },
    { value: "Rabi", label: "Rabi (Winter)" },
    { value: "Zaid", label: "Zaid (Post-Winter/Pre-Monsoon)" },
    { value: "Whole Year", label: "Whole Year" },
];

const formSchema = z.object({
  cropType: z.string().min(2, { message: 'Crop type must be at least 2 characters.' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters (e.g., City, Country).' }),
  plantingDate: z.date({ required_error: 'Planting date is required.' }),
  season: z.string().min(1, { message: 'Season is required.' }),
  landAreaHectares: z.coerce.number().min(0.01, { message: 'Land area must be a positive number greater than 0.' }),
});

type CropYieldFormValues = z.infer<typeof formSchema>;

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultCard: FC<{ result: PredictCropYieldOutput }> = ({ result }) => {
  const confidencePercentage = result.confidenceScore ? (result.confidenceScore * 100).toFixed(1) + "%" : "N/A";
  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mt-6 bg-card text-card-foreground shadow-xl border border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl text-primary">{pageStrings.resultTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{pageStrings.predictedYieldLabel}</p>
              <p className="text-3xl font-bold text-primary">
                {result.predictedYieldKgPerHa.toLocaleString()} {pageStrings.resultUnit}
              </p>
            </div>

            {result.confidenceScore !== undefined && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{pageStrings.confidenceScoreLabel}</p>
                <p className="text-lg text-foreground">{confidencePercentage}</p>
              </div>
            )}

            {result.factorsConsidered && result.factorsConsidered.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{pageStrings.factorsConsideredLabel}</p>
                <ul className="list-disc list-inside text-sm text-foreground space-y-1 pl-2">
                  {result.factorsConsidered.map((factor, index) => <li key={index}>{factor}</li>)}
                </ul>
              </div>
            )}

            {result.potentialRisks && result.potentialRisks.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                  <AlertTriangleIcon className="h-4 w-4 text-destructive" />
                  {pageStrings.potentialRisksLabel}
                </p>
                <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1 pl-2">
                  {result.potentialRisks.map((risk, index) => <li key={index}>{risk}</li>)}
                </ul>
              </div>
            )}
            
          </CardContent>
        </Card>
      </motion.div>
  );
};


const CropYieldPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictCropYieldOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<CropYieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: '',
      location: '',
      plantingDate: undefined,
      season: '',
      landAreaHectares: undefined,
    },
  });

  const onSubmit = async (values: CropYieldFormValues) => {
    setLoading(true);
    setResult(null);

    const inputData: PredictCropYieldInput = {
      ...values,
      plantingDate: format(values.plantingDate, 'yyyy-MM-dd'),
      landAreaHectares: Number(values.landAreaHectares) // Ensure it's a number
    };

    try {
      const prediction = await predictCropYield(inputData);
      setResult(prediction);
    } catch (err) {
      console.error('Error predicting crop yield:', err);
      const message = err instanceof Error ? err.message : pageStrings.predictionFailedErrorDescription;
      toast({
        title: pageStrings.predictionFailedErrorTitle,
        description: message,
        variant: "destructive"
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.cropTypeLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={pageStrings.cropTypePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.locationLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={pageStrings.locationPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="landAreaHectares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.landAreaLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={pageStrings.landAreaPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plantingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{pageStrings.plantingDateLabel}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{pageStrings.pickDate}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.seasonLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={pageStrings.seasonPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {seasonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {pageStrings.predictingButton}
                  </>
                ) : (
                  pageStrings.predictButton
                )}
              </Button>
            </form>
          </Form>

          <AnimatePresence>
            {loading && <LoadingSpinner />}
            {/* Error display removed as it's handled by toast now */}
            {result && !loading && <ResultCard result={result} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropYieldPage;
