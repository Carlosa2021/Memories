'use client';

import { useParams } from 'next/navigation';
import {
  useReadContract,
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
} from 'thirdweb/react';
import {
  nftCollectionContract,
  erc1155CollectionContract,
  marketplaceContract,
} from '@/lib/contracts';
import { useState, useEffect } from 'react';
import { BuyDirectListingButton } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';

interface NFTMetadata {
  [key: string]: unknown;
  name?: string;
  description?: string;
  image?: string;
  ubicacion?: string;
  habitaciones?: string | number;
  superficie?: string | number;
}

// Utilidad para decidir el contrato según assetContract
function getContractByAddress(address: string) {
  if (address?.toLowerCase() === nftCollectionContract.address.toLowerCase()) {
    return nftCollectionContract;
  }
  if (
    address?.toLowerCase() === erc1155CollectionContract.address.toLowerCase()
  ) {
    return erc1155CollectionContract;
  }
  return null;
}

export default function PropertyPage() {
  const { id } = useParams();
  const stringId = Array.isArray(id) ? id[0] : id;
  let listingId: bigint | undefined = undefined;
  try {
    listingId = stringId ? BigInt(stringId) : undefined;
  } catch {}

  const method =
    'function getListing(uint256 _listingId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)';

  const { data: listingRaw, isLoading } = useReadContract({
    contract: marketplaceContract,
    method,
    params: listingId !== undefined ? [listingId] : [0n],
  });

  const validListing =
    listingRaw &&
    typeof listingRaw === 'object' &&
    'listingId' in listingRaw &&
    'tokenId' in listingRaw &&
    'pricePerToken' in listingRaw;

  const tokenId = validListing ? (listingRaw.tokenId as bigint) : undefined;
  const pricePerToken = validListing
    ? (listingRaw.pricePerToken as bigint)
    : undefined;
  const detailListingId = validListing
    ? (listingRaw.listingId as bigint)
    : undefined;
  const assetContractAddress: string | undefined = validListing
    ? String(listingRaw.assetContract)
    : undefined;
  const tokenType: number | undefined = validListing
    ? Number(listingRaw.tokenType)
    : undefined; // 0 = ERC-721, 1 = ERC-1155

  // Selecciona el contrato adecuado
  const nftContract = assetContractAddress
    ? getContractByAddress(assetContractAddress)
    : null;

  // tokenURI para colección correspondiente
  const { data: tokenUriRaw } = useReadContract({
    contract: nftContract ? nftContract : nftCollectionContract,
    method: 'tokenURI',
    params: [tokenId ?? 0n] as [bigint],
  });

  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

  useEffect(() => {
    if (!tokenUriRaw) return;
    const uri = String(tokenUriRaw).startsWith('ipfs://')
      ? String(tokenUriRaw).replace('ipfs://', 'https://ipfs.io/ipfs/')
      : String(tokenUriRaw);
    fetch(uri)
      .then((res) => res.json())
      .then(setMetadata)
      .catch(() => setMetadata(null));
  }, [tokenUriRaw]);

  if (!stringId || listingId === undefined)
    return <p>Propiedad no encontrada.</p>;
  if (isLoading) return <p>Cargando propiedad...</p>;
  if (!validListing) return <p>Propiedad no encontrada.</p>;

  // Visual tipo de token
  let tipoLabel = '';
  if (typeof tokenType === 'number') {
    if (tokenType === 0) tipoLabel = 'ERC-721';
    else if (tokenType === 1) tipoLabel = 'ERC-1155';
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <NFTProvider
        contract={nftContract ?? nftCollectionContract}
        tokenId={tokenId!}
      >
        <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
          {/* Imagen */}
          <div className="w-full h-96 md:h-full">
            <NFTMedia className="w-full h-full object-cover rounded-xl" />
          </div>

          {/* Contenido */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                <NFTName />
                {tipoLabel && (
                  <span className="ml-4 inline-block px-2 text-xs font-semibold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
                    {tipoLabel}
                  </span>
                )}
              </h1>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                <NFTDescription />
              </p>
              <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                Precio: {pricePerToken ? Number(pricePerToken) / 1e18 : '--'}{' '}
                POL
              </p>
              {tokenType === 1 && validListing && (
                <p className="text-purple-700 mb-4">
                  Disponibles: <b>{String(listingRaw.quantity)}</b>
                </p>
              )}
              {metadata && (
                <div className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200 mb-6">
                  {metadata.ubicacion && (
                    <p>
                      <b>Ubicación:</b> {metadata.ubicacion}
                    </p>
                  )}
                  {metadata.habitaciones && (
                    <p>
                      <b>Habitaciones:</b> {metadata.habitaciones}
                    </p>
                  )}
                  {metadata.superficie && (
                    <p>
                      <b>Superficie:</b> {metadata.superficie} m²
                    </p>
                  )}
                  {Object.entries(metadata)
                    .filter(
                      ([key]) =>
                        ![
                          'name',
                          'description',
                          'image',
                          'ubicacion',
                          'habitaciones',
                          'superficie',
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <p key={key}>
                        <b>{key}:</b> {String(value)}
                      </p>
                    ))}
                </div>
              )}
            </div>
            {validListing && listingRaw.status === 1 ? (
              <BuyDirectListingButton
                contractAddress={marketplaceContract.address}
                listingId={detailListingId!}
                quantity={1n}
                client={client}
                chain={polygon}
                onTransactionConfirmed={() =>
                  alert('¡Compra realizada con éxito!')
                }
                onError={(err) => alert('Error en la compra: ' + err.message)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Comprar
              </BuyDirectListingButton>
            ) : (
              <p className="text-lg text-gray-400 mt-4 font-semibold">
                Propiedad no disponible para comprar. Si el propietario la
                vuelve a listar, aparecerá aquí.
              </p>
            )}
          </div>
        </div>
      </NFTProvider>
    </div>
  );
}
