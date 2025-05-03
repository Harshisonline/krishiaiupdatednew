/**
 * Represents a government scheme.
 */
export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string[];
  link: string;
  icon?: React.ComponentType<{ className?: string }>; // Optional icon component
}

// Simulate fetching data from a backend API
export async function getGovernmentSchemes(): Promise<GovernmentScheme[]> {
  // Replace this with an actual API call in a real application
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  return [
    {
      id: 'pm-kisan',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      description: 'A central sector scheme with 100% funding from the Government of India. It aims to supplement the financial needs of the Small and Marginal Farmers (SMFs).',
      eligibility: 'All landholding farmer families, subject to certain exclusion criteria.',
      benefits: ['Income support of Rs. 6,000/- per year in three equal installments.'],
      link: 'https://pmkisan.gov.in/',
      // icon: // Add an icon component if desired
    },
    {
      id: 'fasal-bima',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Provides comprehensive insurance coverage against crop failure, helping to stabilize the income of farmers.',
      eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas are eligible for coverage.',
      benefits: ['Financial support in case of crop loss/damage.', 'Uniform premium rates.'],
      link: 'https://pmfby.gov.in/',
      // icon: // Add an icon component if desired
    },
    {
      id: 'soil-health-card',
      title: 'Soil Health Card Scheme',
      description: 'A scheme to provide farmers with soil health cards, which contain information about the nutrient status of their soil along with recommendations on the appropriate dosage of nutrients to be applied for improving soil health and fertility.',
      eligibility: 'All farmers are eligible to get the Soil Health Card.',
      benefits: ['Information on soil nutrient status.', 'Recommendations for fertilizer application.', 'Improved crop yield and soil health.'],
      link: 'https://soilhealth.dac.gov.in/',
      // icon: // Add an icon component if desired
    },
    {
        id: 'kcc',
        title: 'Kisan Credit Card (KCC)',
        description: 'A scheme aimed at providing adequate and timely credit support from the banking system under a single window to the farmers for their cultivation & other needs.',
        eligibility: 'Farmers - individual/joint borrowers who are owner cultivators; Tenant farmers, Oral lessees & Share Croppers; SHGs or Joint Liability Groups of farmers including tenant farmers, share croppers etc.',
        benefits: ['Access to credit at lower interest rates.', 'Flexible repayment options.', 'Coverage for various agricultural and allied activities.'],
        link: 'https://www.rbi.org.in/', // General RBI link, specific bank links vary
        // icon: // Add an icon component if desired
    }
  ];
}
