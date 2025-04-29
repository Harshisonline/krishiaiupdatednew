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
import { Loader2, Upload, X, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultDisplay: FC<{ result: DiagnoseCropDiseaseOutput }> = ({ result }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <Alert variant={result.hasDisease ? "destructive" : "default"} className="bg-secondary text-secondary-foreground shadow-md">
       <div className="flex items-center gap-2">
         {result.hasDisease ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-primary" />}
         <AlertTitle className="font-bold">
           {result.hasDisease ? `Disease Detected: ${result.diseaseName || 'Unknown Disease'}` : 'No Disease Detected'}
         </AlertTitle>
       </div>
      <AlertDescription className="mt-2">
        {!result.isPlant && <p className="mb-2 font-medium">Note: The uploaded image does not appear to be a plant.</p>}
        {result.hasDisease && result.treatmentRecommendations && (
          <div>
            <h4 className="font-semibold mt-3 mb-1 text-foreground">Treatment Recommendations:</h4>
            <p>{result.treatmentRecommendations}</p>
          </div>
        )}
        {!result.hasDisease && result.isPlant && (
           <p>The analysis indicates the plant appears healthy.</p>
        )}
      </AlertDescription>
    </Alert>
  </motion.div>
);


const CropDiseasePage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size if necessary
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, WEBP).",
          variant: "destructive",
        });
        return;
      }
       // Max 5MB size validation
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
         toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
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
          title: "No Image Selected",
          description: "Please select an image to diagnose.",
          variant: "destructive",
        });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Ensure previewUrl is a valid data URI string
      if (typeof previewUrl !== 'string' || !previewUrl.startsWith('data:image/')) {
         throw new Error('Invalid image data format.');
      }
      const prediction = await diagnoseCropDisease({ photoDataUri: previewUrl });
      setResult(prediction);
    } catch (err) {
      console.error('Error diagnosing crop disease:', err);
      setError('Failed to diagnose crop disease. Please check the image or try again.');
       toast({
          title: "Diagnosis Failed",
          description: error || "An unexpected error occurred.",
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
        Back to Home
      </Link>
      <Card className="w-full shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Crop Disease Detection</CardTitle>
          <CardDescription>Upload a photo of your crop to identify potential diseases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="crop-picture">Upload Crop Photo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="crop-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-grow"
                  aria-label="Upload Crop Photo"
                />
                 <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Select Image">
                   <Upload className="h-4 w-4" />
                 </Button>
              </div>
              <p className="text-xs text-muted-foreground">Upload an image (JPG, PNG, WEBP, max 5MB).</p>
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
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                <Image
                  src={previewUrl}
                  alt="Crop preview"
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
              {loading ? 'Diagnosing...' : 'Diagnose Crop'}
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

export default CropDiseasePage;
