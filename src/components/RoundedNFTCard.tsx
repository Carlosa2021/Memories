/* 'use client';

import { useRouter } from 'next/navigation';
import { NFTProvider, NFTMedia, NFTName, NFTDescription } from 'thirdweb/react';
import type { ThirdwebContract } from 'thirdweb';
import { Card, CardContent } from '@/components/ui/card';

export interface RoundedNFTCardProps {
  listingId: number;
  tokenId: number;
  contract: ThirdwebContract;
  price: string;
}

export const RoundedNFTCard = ({
  listingId,
  tokenId,
  contract,
  price,
}: RoundedNFTCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/marketplace/detalles_propiedad/${listingId}`)
      }
      className="cursor-pointer"
    >
      <NFTProvider contract={contract} tokenId={BigInt(tokenId)}>
        <Card className="transition-transform hover:scale-105 rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900">
          <div className="w-full h-60 md:h-full">
            <NFTMedia className="w-full h-full object-cover rounded-xl" />
          </div>

          <CardContent className="p-4">
            <NFTName className="text-lg font-semibold mb-1 text-zinc-800 dark:text-zinc-100 truncate" />
            <NFTDescription
              className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            />
            <p className="text-sm font-semibold mt-3 text-indigo-700 dark:text-indigo-300">
              Precio: {price}
            </p>
          </CardContent>
        </Card>
      </NFTProvider>
    </div>
  );
};
*/
