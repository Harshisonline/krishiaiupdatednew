'use server';
/**
 * @fileOverview A crop disease diagnosis AI agent.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether or not the input is a plant.'),
  hasDisease: z.boolean().describe('Whether or not the plant has a disease.'),
  diseaseName: z.string().describe('The name of the disease, if any.').optional(),
  treatmentRecommendations: z.string().describe('Treatment recommendations for the disease, if any.').optional(),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      isPlant: z.boolean().describe('Whether or not the input is a plant.'),
      hasDisease: z.boolean().describe('Whether or not the plant has a disease.'),
      diseaseName: z.string().describe('The name of the disease, if any.').optional(),
      treatmentRecommendations: z.string().describe('Treatment recommendations for the disease, if any.').optional(),
    }),
  },
  prompt: `You are an expert in diagnosing crop diseases. Analyze the image and determine if it is a plant, whether it has a disease, and suggest treatments if necessary.

Analyze the following image:
{{media url=photoDataUri}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow<
  typeof DiagnoseCropDiseaseInputSchema,
  typeof DiagnoseCropDiseaseOutputSchema
>(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
