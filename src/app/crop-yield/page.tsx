'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { predictCropYield, type CropYield } from '@/services/crop-yield';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  cropType: z.string().min(2, { message: 'Crop type must be at least 2 characters.' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }),
  plantingDate: z.date({ required_error: 'Planting date is required.' }),
});

type CropYieldFormValues = z.infer<typeof formSchema>;

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultCard: FC<{ result: CropYield }> = ({ result }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="mt-6 bg-secondary text-secondary-foreground shadow-md">
      <CardHeader>
        <CardTitle>Predicted Yield</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-primary">
          {result.predictedYieldKg.toLocaleString()} kg
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Estimated yield based on provided data. Actual results may vary.
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const CropYieldPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CropYield | null>(null);

  const form = useForm<CropYieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: '',
      location: '',
      plantingDate: undefined,
    },
  });

  const onSubmit = async (values: CropYieldFormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formattedData = {
        ...values,
        plantingDate: format(values.plantingDate, 'yyyy-MM-dd'), // Format date for API
      };
      const prediction = await predictCropYield(formattedData);
      setResult(prediction);
    } catch (err) {
      console.error('Error predicting crop yield:', err);
      setError('Failed to predict crop yield. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>
      <Card className="w-full shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Crop Yield Prediction</CardTitle>
          <CardDescription>Enter your crop details to estimate the potential yield.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wheat, Corn, Rice" {...field} />
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
                    <FormLabel>Location (City/Region)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Valley, CA" {...field} />
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
                    <FormLabel>Planting Date</FormLabel>
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
                              <span>Pick a date</span>
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? 'Predicting...' : 'Predict Yield'}
              </Button>
            </form>
          </Form>

          <AnimatePresence>
            {loading && <LoadingSpinner />}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-destructive"
              >
                {error}
              </motion.p>
            )}
            {result && <ResultCard result={result} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropYieldPage;
