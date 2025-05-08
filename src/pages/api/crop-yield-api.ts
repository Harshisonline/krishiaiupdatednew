import { NextApiRequest, NextApiResponse } from 'next';
import { predictCropYield, type CropData, type CropYield } from '../../services/crop-yield';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CropYield | { error: string }>
) {
  if (req.method === 'POST') {
    try {
      const cropData: CropData = req.body;
      // Ensure all required fields are present, including the new 'season' field
      if (!cropData.cropType || !cropData.location || !cropData.plantingDate || !cropData.season) {
        return res.status(400).json({ error: 'Missing required fields in request body.' });
      }
      const predictedYield = await predictCropYield(cropData);
      res.status(200).json(predictedYield);
    } catch (error) {
      console.error('Error predicting crop yield:', error);
      const message = error instanceof Error ? error.message : 'Failed to predict crop yield';
      res.status(500).json({ error: message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
