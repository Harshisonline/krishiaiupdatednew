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
import { useTranslations } from 'next-intl';

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ResultDisplay: FC<{ result: DiagnoseCropDiseaseOutput }> = ({ result }) => {
  const t = useTranslations('CropDiseasePage');
  const diseaseName = result.diseaseName || t('resultTitleUnknownDisease').split(': ')[1]; // Extract default name if none provided
  const title = result.hasDisease ? t('resultTitleDisease', { diseaseName }) : t('resultTitleNoDisease');

  return (
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
             {title}
           </AlertTitle>
         </div>
        <AlertDescription className="mt-2">
          {!result.isPlant && <p className="mb-2 font-medium">{t('resultNoteNotPlant')}</p>}
          {result.hasDisease && result.treatmentRecommendations && (
            <div>
              <h4 className="font-semibold mt-3 mb-1 text-foreground">{t('resultRecommendationsHeading')}</h4>
              <p>{result.treatmentRecommendations}</p>
            </div>
          )}
          {!result.hasDisease && result.isPlant && (
             <p>{t('resultHealthyMessage')}</p>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};


const CropDiseasePage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Keep internal error state if needed for logic, but rely on toast for display
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const t = useTranslations('CropDiseasePage');
  const tNav = useTranslations('Navigation');


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size if necessary
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('invalidFileTypeErrorTitle'),
          description: t('invalidFileTypeErrorDescription'),
          variant: "destructive",
        });
        return;
      }
       // Max 5MB size validation
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
         toast({
          title: t('fileTooLargeErrorTitle'),
          description: t('fileTooLargeErrorDescription'),
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
          title: t('noImageErrorTitle'),
          description: t('noImageErrorDescription'),
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
         throw new Error(t('invalidImageDataError'));
      }
      const prediction = await diagnoseCropDisease({ photoDataUri: previewUrl });
      setResult(prediction);
    } catch (err) {
      console.error('Error diagnosing crop disease:', err);
      const message = err instanceof Error ? err.message : t('diagnosisFailedErrorDescription');
      setError(message); // Set internal error state if needed
       toast({
          title: t('diagnosisFailedErrorTitle'),
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
        {tNav('backToHome')}
      </Link>
      <Card className="w-full shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="crop-picture">{t('uploadLabel')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="crop-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-grow"
                  aria-label={t('uploadLabel')}
                />
                 <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label={t('selectImageLabel')}>
                   <Upload className="h-4 w-4" />
                 </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('uploadHint')}</p>
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
                    aria-label={t('removeImageLabel')}
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
              {loading ? t('diagnosingButton') : t('diagnoseButton')}
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
