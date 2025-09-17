'use client';
import React from 'react';
import { NFTProvider, NFTMedia, NFTName, NFTDescription } from 'thirdweb/react';
import { useDirectListings } from '@/lib/thirdweb/hooks/useListings';
import { Card, CardContent } from '@/components/ui/card';
import { nftCollectionContract } from '@/lib/contracts';

export default function PropertyList() {
  const { listings, isLoading, error } = useDirectListings();

  if (isLoading)
    return <p className="py-12 text-center text-lg">Cargando propiedades...</p>;
  if (error)
    return (
      <p className="py-12 text-center text-red-500">
        Error cargando listings: {error.message}
      </p>
    );
  if (!listings || listings.length === 0) {
    return (
      <div className="py-16 text-center text-xl text-muted-foreground">
        No hay propiedades listadas actualmente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {listings.map((listing) => (
        <NFTProvider
          contract={nftCollectionContract}
          tokenId={listing.tokenId}
          key={String(listing.id)}
        >
          <Card className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 border hover:scale-105 transition-transform overflow-hidden cursor-pointer">
            <div className="w-full h-60 bg-card dark:bg-zinc-900">
              <NFTMedia className="w-full h-full object-cover rounded-t-2xl bg-card dark:bg-zinc-900" />
            </div>
            <CardContent className="p-4 flex flex-col gap-2">
              <NFTName className="text-lg font-bold truncate text-foreground" />
              <NFTDescription className="text-xs text-muted-foreground line-clamp-2" />
              <p className="mt-2 font-medium text-indigo-600 dark:text-indigo-300">
                <span className="text-base">
                  {listing.currencyValuePerToken?.displayValue}{' '}
                  {listing.currencyValuePerToken?.symbol}
                </span>
              </p>
              {/* Botones extra aquí... */}
            </CardContent>
          </Card>
        </NFTProvider>
      ))}
    </div>
  );
}
