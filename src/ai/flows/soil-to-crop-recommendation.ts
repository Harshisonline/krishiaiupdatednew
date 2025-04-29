'use server';
/**
 * @fileOverview Recommends crops based on soil analysis from an image.
 *
 * - recommendCrops - A function that handles the crop recommendation process.
 * - RecommendCropsInput - The input type for the recommendCrops function.
 * - RecommendCropsOutput - The return type for the recommendCrops function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecommendCropsInputSchema = z.object({
  soilPhotoDataUri: z
    .string()
    .describe(
      "A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecommendCropsInput = z.infer<typeof RecommendCropsInputSchema>;

const RecommendCropsOutputSchema = z.object({
  soilType: z.string().describe('The type of soil detected in the image.'),
  recommendedCrops: z
    .array(z.string())
    .describe('A list of crops recommended for the detected soil type.'),
});
export type RecommendCropsOutput = z.infer<typeof RecommendCropsOutputSchema>;

export async function recommendCrops(input: RecommendCropsInput): Promise<RecommendCropsOutput> {
  return recommendCropsFlow(input);
}

const identifySoilAndSuggestCrops = ai.defineTool({
  name: 'identifySoilAndSuggestCrops',
  description:
    'Analyzes a soil image to identify the soil type and recommend suitable crops.',
  inputSchema: z.object({
    soilPhotoDataUri: z
      .string()
      .describe(
        "A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  }),
  outputSchema: z.object({
    soilType: z.string().describe('The type of soil detected in the image.'),
    recommendedCrops: z
      .array(z.string())
      .describe('A list of crops recommended for the detected soil type.'),
  }),
},
async input => {
  // Placeholder implementation - replace with actual soil analysis and crop recommendation logic
  const soilType = 'Loam';
  const recommendedCrops = ['Tomatoes', 'Lettuce', 'Corn'];

  return {
    soilType: soilType,
    recommendedCrops: recommendedCrops,
  };
});

const prompt = ai.definePrompt({
  name: 'recommendCropsPrompt',
  input: {
    schema: z.object({
      soilPhotoDataUri: z
        .string()
        .describe(
          "A photo of the soil, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      soilType: z.string().describe('The type of soil detected in the image.'),
      recommendedCrops: z
        .array(z.string())
        .describe('A list of crops recommended for the detected soil type.'),
    }),
  },
  prompt: `You are an expert agricultural advisor. Analyze the provided soil image and recommend suitable crops.

  Soil Image: {{media url=soilPhotoDataUri}}

  Based on the soil type, which crops would thrive in this soil?  Use the identifySoilAndSuggestCrops to determine this.`,
  tools: [identifySoilAndSuggestCrops],
});

const recommendCropsFlow = ai.defineFlow<
  typeof RecommendCropsInputSchema,
  typeof RecommendCropsOutputSchema
>({
  name: 'recommendCropsFlow',
  inputSchema: RecommendCropsInputSchema,
  outputSchema: RecommendCropsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

