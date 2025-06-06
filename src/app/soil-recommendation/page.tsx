'use client';

import type { FC } from 'react';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recommendCrops, type RecommendCropsOutput } from '@/ai/flows/soil-to-crop-recommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, X, Leaf, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Hardcoded English Strings
const pageStrings = {
    title: "Soil-to-Crop Recommendation",
    description: "Upload a photo of your soil to find the best crops to grow.",
    uploadLabel: "Upload Soil Photo",
    uploadHint: "Upload an image (JPG, PNG, WEBP, max 5MB).",
    selectImageLabel: "Select Image",
    removeImageLabel: "Remove image",
    recommendButton: "Get Recommendations",
    analyzingButton: "Analyzing...",
    noImageErrorTitle: "No Image Selected",
    noImageErrorDescription: "Please select an image of the soil.",
    invalidFileTypeErrorTitle: "Invalid File Type",
    invalidFileTypeErrorDescription: "Please upload an image file (e.g., JPG, PNG, WEBP).",
    fileTooLargeErrorTitle: "File Too Large",
    fileTooLargeErrorDescription: "Please upload an image smaller than 5MB.",
    recommendationFailedErrorTitle: "Recommendation Failed",
    recommendationFailedErrorDescription: "Failed to get soil recommendations. Please check the image or try again.",
    invalidImageDataError: "Invalid image data format.",
    resultTitle: "Soil Analysis & Recommendations",
    resultSoilTypeHeading: "Detected Soil Type:",
    resultRecommendationsHeading: "Recommended Crops:",
    resultNoRecommendations: "No specific crop recommendations available for this soil type.",
    backToHome: "Back to Home"
};

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultDisplay: FC<{ result: RecommendCropsOutput }> = ({ result }) => {
 return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <Card className="bg-secondary text-secondary-foreground shadow-md">
        <CardHeader>
           <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <CardTitle>{pageStrings.resultTitle}</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="space-y-3">
           <div>
             <h4 className="font-semibold text-foreground">{pageStrings.resultSoilTypeHeading}</h4>
             <p className="text-lg font-medium text-primary">{result.soilType}</p>
           </div>
            <div>
              <h4 className="font-semibold text-foreground">{pageStrings.resultRecommendationsHeading}</h4>
              {result.recommendedCrops.length > 0 ? (
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {result.recommendedCrops.map((crop) => (
                    <li key={crop}>{crop}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{pageStrings.resultNoRecommendations}</p>
              )}
           </div>
        </CardContent>
     </Card>
  </motion.div>
 );
};


const SoilRecommendationPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Keep internal state if needed, toast handles display
  const [result, setResult] = useState<RecommendCropsOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       if (!file.type.startsWith('image/')) {
        toast({
          title: pageStrings.invalidFileTypeErrorTitle,
          description: pageStrings.invalidFileTypeErrorDescription,
          variant: "destructive",
        });
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
         toast({
          title: pageStrings.fileTooLargeErrorTitle,
          description: pageStrings.fileTooLargeErrorDescription,
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setResult(null); // Clear previous results
      setError(null); // Clear previous errors

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

   const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) {
       toast({
          title: pageStrings.noImageErrorTitle,
          description: pageStrings.noImageErrorDescription,
          variant: "destructive",
        });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
       if (typeof previewUrl !== 'string' || !previewUrl.startsWith('data:image/')) {
         throw new Error(pageStrings.invalidImageDataError);
      }
      const prediction = await recommendCrops({ soilPhotoDataUri: previewUrl });
      setResult(prediction);
    } catch (err) {
      console.error('Error getting soil recommendations:', err);
      const message = err instanceof Error ? err.message : pageStrings.recommendationFailedErrorDescription;
      setError(message); // Set internal error state if needed
       toast({
          title: pageStrings.recommendationFailedErrorTitle,
          description: message,
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
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="soil-picture">{pageStrings.uploadLabel}</Label>
               <div className="flex items-center gap-2">
                <Input
                  id="soil-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-grow"
                  aria-label={pageStrings.uploadLabel}
                />
                 <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label={pageStrings.selectImageLabel}>
                   <Upload className="h-4 w-4" />
                 </Button>
              </div>
               <p className="text-xs text-muted-foreground">{pageStrings.uploadHint}</p>
            </div>

            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative border border-dashed border-border rounded-md p-4"
              >
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 z-10 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    onClick={handleRemoveImage}
                    aria-label={pageStrings.removeImageLabel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                <Image
                  src={previewUrl}
                  alt="Soil preview"
                  width={400}
                  height={300}
                  className="rounded-md object-contain max-h-[300px] w-full"
                />
              </motion.div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || !selectedFile}
            >
              {loading ? pageStrings.analyzingButton : pageStrings.recommendButton}
            </Button>
          </div>

          <AnimatePresence>
            {loading && <LoadingSpinner />}
             {/* Error display removed as it's handled by toast now */}
            {result && <ResultDisplay result={result} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoilRecommendationPage;
