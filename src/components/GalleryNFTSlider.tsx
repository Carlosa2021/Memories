/* 'use client';

// import { useEffect, useState } from 'react';
import { NFTProvider, NFTMedia, NFTName, NFTDescription } from 'thirdweb/react';
import type { ThirdwebContract } from 'thirdweb';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface NFT {
  listingId: number;
  tokenId: number;
  contract: ThirdwebContract;
  price: string;
}

interface GallerySliderProps {
  nfts: NFT[];
}

export default function GalleryNFTSlider({ nfts }: GallerySliderProps) {
  const router = useRouter();

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-6 p-4 min-w-max">
        {nfts.map((nft) => (
          <div
            key={nft.listingId}
            onClick={() =>
              router.push(`/marketplace/detalles_propiedad/${nft.listingId}`)
            }
            className="cursor-pointer min-w-[260px] max-w-[280px] flex-shrink-0"
          >
            <NFTProvider contract={nft.contract} tokenId={BigInt(nft.tokenId)}>
              <Card className="rounded-2xl shadow-md overflow-hidden bg-white dark:bg-zinc-900 transition-transform hover:scale-105">
                <div className="w-full h-52">
                  <NFTMedia className="w-full h-full object-cover rounded-xl" />
                </div>
                <CardContent className="p-3">
                  <NFTName className="text-md font-bold text-zinc-800 dark:text-zinc-100 truncate mb-1" />
                  <NFTDescription
                    className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2"
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  />
                  <p className="text-sm font-semibold mt-2 text-indigo-700 dark:text-indigo-300">
                    Precio: {nft.price}
                  </p>
                </CardContent>
              </Card>
            </NFTProvider>
          </div>
        ))}
      </div>
    </div>
  );
}
*/
