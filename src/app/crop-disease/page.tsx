
'use client';

import type { FC } from 'react';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, X, ArrowLeft, Info, Sparkles, Percent } from 'lucide-react'; 
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Hardcoded English Strings
const pageStrings = {
    title: "Crop Disease Detection",
    description: "Upload a photo of your crop to identify potential diseases using our AI model.",
    uploadLabel: "Upload Crop Photo",
    uploadHint: "Upload an image (JPG, PNG, WEBP, max 5MB).",
    selectImageLabel: "Select Image",
    removeImageLabel: "Remove image",
    diagnoseButton: "Diagnose Crop",
    diagnosingButton: "Diagnosing...",
    noImageErrorTitle: "No Image Selected",
    noImageErrorDescription: "Please select an image to diagnose.",
    invalidFileTypeErrorTitle: "Invalid File Type",
    invalidFileTypeErrorDescription: "Please upload an image file (e.g., JPG, PNG, WEBP).",
    fileTooLargeErrorTitle: "File Too Large",
    fileTooLargeErrorDescription: "Please upload an image smaller than 5MB.",
    diagnosisFailedErrorTitle: "Diagnosis Failed",
    diagnosisFailedErrorDescription: "Failed to diagnose crop disease. Please check the image or try again.",
    invalidImageDataError: "Invalid image data format.",
    resultTitle: "Diagnosis Result", 
    confidenceLabel: "Confidence Score",
    predictedClassLabel: "Predicted Disease/Class",
    // apiRawResponseTitle: "Raw API Response", // Removed as per request
    backToHome: "Back to Home",
    processingError: "Could not process the API response. The format might be unexpected.",
};

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultDisplay: FC<{ result: DiagnoseCropDiseaseOutput }> = ({ result }) => {
  let confidence: number | undefined;
  let predictedClass: string | undefined;
  let displayError: string | null = null;

  if (result.api_response && typeof result.api_response === 'object') {
    const apiResponse = result.api_response as any;
    if (typeof apiResponse.confidence === 'number') {
      confidence = parseFloat(apiResponse.confidence.toFixed(2));
    }
    if (typeof apiResponse.predicted_class === 'string') {
      predictedClass = apiResponse.predicted_class.replace(/_/g, ' '); // Replace underscores with spaces
    }

    if (confidence === undefined || predictedClass === undefined) {
        console.warn("API response is missing expected fields 'confidence' or 'predicted_class'.", result.api_response);
        displayError = pageStrings.processingError;
    }
  } else {
     console.warn("API response is not in the expected object format.", result.api_response);
     displayError = pageStrings.processingError;
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-6 space-y-4"
    >
        <Card className="bg-secondary text-secondary-foreground shadow-md">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle>{pageStrings.resultTitle}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayError ? (
                     <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Error Processing Response</AlertTitle>
                        <AlertDescription>{displayError}</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        {predictedClass !== undefined && (
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">{pageStrings.predictedClassLabel}</h4>
                                <p className="text-lg font-medium text-primary">{predictedClass}</p>
                            </div>
                        )}
                        {confidence !== undefined && (
                             <div className="flex items-center">
                                <Percent className="h-4 w-4 mr-2 text-primary" />
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">{pageStrings.confidenceLabel}</h4>
                                    <p className="text-lg font-medium text-primary">{confidence}%</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
        
        {/* Raw API Response Display Removed 
        <Alert variant="default" className="bg-muted/50 text-muted-foreground shadow-sm">
            <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-foreground" />
                <AlertTitle className="font-semibold text-foreground">
                    {pageStrings.apiRawResponseTitle}
                </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
                <pre className="p-2 bg-background/50 text-foreground rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(result.api_response, null, 2)}
                </pre>
            </AlertDescription>
        </Alert> 
        */}
    </motion.div>
  );
};


const CropDiseasePage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
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
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
         toast({
          title: pageStrings.fileTooLargeErrorTitle,
          description: pageStrings.fileTooLargeErrorDescription,
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setResult(null); 

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
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
    setResult(null);

    try {
      if (typeof previewUrl !== 'string' || !previewUrl.startsWith('data:image/')) {
         throw new Error(pageStrings.invalidImageDataError);
      }
      const prediction = await diagnoseCropDisease({ photoDataUri: previewUrl });
      setResult(prediction);
    } catch (err) {
      console.error('Error diagnosing crop disease:', err);
      const message = err instanceof Error ? err.message : pageStrings.diagnosisFailedErrorDescription;
       toast({
          title: pageStrings.diagnosisFailedErrorTitle,
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
              <Label htmlFor="crop-picture">{pageStrings.uploadLabel}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="crop-picture"
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
                  alt="Crop preview"
                  width={400}
                  height={300}
                  className="rounded-md object-contain max-h-[300px] w-full"
                  data-ai-hint="crop disease"
                />
              </motion.div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {pageStrings.diagnosingButton}
                </>
              ) : (
                pageStrings.diagnoseButton
              )}
            </Button>
          </div>

          <AnimatePresence>
            {loading && <LoadingSpinner />}
            {result && !loading && <ResultDisplay result={result} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropDiseasePage;

