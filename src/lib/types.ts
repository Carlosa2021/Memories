// src/lib/types.ts
export interface NFTListing {
    id: string;
    asset: {
      image: string;
      name: string;
      description: string;
      metadata?: {
        image?: string;
        name?: string;
        description?: string;
      };
    };
    currencyValuePerToken: {
      displayValue: string;
      symbol: string;
    };
  }
  