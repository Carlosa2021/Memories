'use client';

import React, { useState, useEffect } from 'react';
import { MediaRenderer } from 'thirdweb/react';
// Intentar primero con ERC-721; si el contrato es Edition Drop (1155) esto sigue funcionando en la mayoría de implementaciones.
// Si fuera necesario cambiar a la extensión erc1155, se puede ajustar dinámicamente.
import { getNFT } from 'thirdweb/extensions/erc721';
import type { ThirdwebContract } from 'thirdweb';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/thirdweb/client-browser';
import { resolveIPFSAll } from '@/lib/ipfs';

console.log(
  'NFTCard > THIRDWEB_CLIENT_ID:',
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
);
console.log('NFTCard > client?.clientId:', client?.clientId);

export interface NFTCardProps {
  listingId: number;
  tokenId: number;
  contract: ThirdwebContract;
  price: string;
}

export const NFTCard = ({
  listingId,
  tokenId,
  contract,
  price,
}: NFTCardProps) => {
  const router = useRouter();
  const [nft, setNFT] = useState<{
    metadata?: {
      name?: string;
      description?: string;
      image?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNFT({ contract, tokenId: BigInt(tokenId) })
      .then(setNFT)
      .finally(() => setLoading(false));
  }, [contract, tokenId]);

  const handleClick = () => {
    router.push(`/marketplace/detalles_propiedad/${listingId}`);
  };

  const [imageCandidates, setImageCandidates] = useState<string[]>([]);
  const [imgIdx, setImgIdx] = useState(0);

  // Cuando cambie el nft, recalculamos candidatos de imagen
  useEffect(() => {
    if (nft?.metadata?.image) {
      const candidates = resolveIPFSAll(nft.metadata.image);
      setImageCandidates(candidates);
      setImgIdx(0);
    }
  }, [nft?.metadata?.image]);

  return (
    <div onClick={handleClick} className="cursor-pointer group">
      <Card className="transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-0 shadow-lg group-hover:shadow-indigo-500/20">
        <div className="w-full h-60 md:h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <span className="text-sm text-gray-500">Cargando...</span>
            </div>
          ) : imageCandidates.length > 0 ? (
            <>
              <MediaRenderer
                client={client}
                src={imageCandidates[imgIdx]}
                className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
              />
              {/* img oculta para detectar error y pasar al siguiente gateway */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageCandidates[imgIdx]}
                alt="hidden-check"
                style={{ display: 'none' }}
                onError={() => {
                  if (imgIdx + 1 < imageCandidates.length) {
                    setImgIdx(imgIdx + 1);
                  }
                }}
              />
            </>
          ) : (
            <span className="text-sm text-red-500">
              No se pudo cargar la imagen
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-lg font-semibold mb-1 text-zinc-800 dark:text-zinc-100 truncate group-hover:text-indigo-600 transition-colors">
            {loading
              ? 'Cargando nombre...'
              : nft?.metadata?.name ?? 'Sin nombre'}
          </p>
          <p
            className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {loading
              ? 'Cargando descripción...'
              : nft?.metadata?.description ?? 'Sin descripción'}
          </p>
          <p className="text-sm font-semibold mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Precio: {price}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
