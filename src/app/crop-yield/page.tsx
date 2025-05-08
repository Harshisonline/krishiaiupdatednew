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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


// Hardcoded English Strings
const pageStrings = {
    title: "Crop Yield Prediction",
    description: "Enter your crop details to estimate the potential yield.",
    cropLabel: "Crop",
    cropPlaceholder: "e.g., Wheat, Corn, Rice",
    stateLabel: "State/Region",
    statePlaceholder: "e.g., California, Punjab",
    seasonLabel: "Season",
    seasonPlaceholder: "Select a season",
    areaLabel: "Land Area (Hectares)",
    areaPlaceholder: "e.g., 2.5",
    predictButton: "Predict Yield",
    predictingButton: "Predicting...",
    predictionFailedErrorTitle: "Prediction Failed",
    predictionFailedErrorDescription: "Failed to predict crop yield. Please check your input or try again later.",
    resultTitle: "Predicted Production",
    predictedProductionLabel: "Estimated Production:",
    // Add unit if known, otherwise just display the number
    // resultUnit: "kg", 
    backToHome: "Back to Home"
};

const seasonOptions = [
    { value: "Kharif", label: "Kharif (Monsoon/Summer)" },
    { value: "Rabi", label: "Rabi (Winter)" },
    { value: "Zaid", label: "Zaid (Post-Winter/Pre-Monsoon)" },
    { value: "Whole Year", label: "Whole Year" },
];

// Updated Zod schema to match backend expectations
const formSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }),
  state: z.string().min(2, { message: 'State/Region must be at least 2 characters.' }),
  season: z.string().min(1, { message: 'Season is required.' }),
  area: z.coerce.number().min(0.01, { message: 'Land area must be a positive number greater than 0.' }),
});

type CropYieldFormValues = z.infer<typeof formSchema>;

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultCard: FC<{ result: PredictCropYieldOutput }> = ({ result }) => {
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
              <p className="text-sm font-semibold text-muted-foreground">{pageStrings.predictedProductionLabel}</p>
              <p className="text-3xl font-bold text-primary">
                {/* Assuming the backend provides the unit or it's implicitly known */}
                {result.predicted_production.toLocaleString()} {/* Add unit if available pageStrings.resultUnit */}
              </p>
            </div>
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
      crop: '',
      state: '',
      season: '',
      area: '', // Initialize with empty string for coerce.number
    },
  });

  const onSubmit = async (values: CropYieldFormValues) => {
    setLoading(true);
    setResult(null);

    const inputData: PredictCropYieldInput = {
      crop: values.crop,
      state: values.state,
      season: values.season,
      area: Number(values.area) // Ensure it's a number
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
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.cropLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={pageStrings.cropPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.stateLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={pageStrings.statePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{pageStrings.areaLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={pageStrings.areaPlaceholder} {...field} />
                    </FormControl>
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
            {result && !loading && <ResultCard result={result} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropYieldPage;
