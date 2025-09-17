'use client';
import { useParams } from 'next/navigation';
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
} from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  nftCollectionContract,
  erc1155CollectionContract,
  marketplaceContract,
} from '@/lib/contracts';

// Type guard to ensure listingRaw is an object (not array)
function isListingObject(x: unknown): x is { [key: string]: unknown } {
  return (
    typeof x === 'object' && x !== null && !Array.isArray(x) && 'tokenId' in x
  );
}

interface MarketplaceListingWithType {
  id: string | number | bigint;
  listingId: string | number | bigint;
  tokenId: string | number | bigint;
  quantity: string | number | bigint;
  pricePerToken: string | number | bigint;
  assetContractAddress: string;
  tokenType: number;
  currencyValuePerToken?: {
    displayValue: string;
    symbol: string;
    value: string;
  };
}

export default function PropertyPage() {
  const params = useParams();
  const idRaw = params?.id;
  const idString =
    typeof idRaw === 'string'
      ? idRaw
      : Array.isArray(idRaw) && idRaw.length > 0
      ? idRaw[0]
      : undefined;
  const listingId = idString ? BigInt(idString) : 0n;

  const { data: listingRaw, isLoading } = useReadContract({
    contract: marketplaceContract,
    method: 'getListing',
    params: [listingId],
  });

  let listing: MarketplaceListingWithType | null = null;
  if (isListingObject(listingRaw)) {
    // Object/struct shape (preferred in modern SDK)
    const raw = listingRaw;
    listing = {
      id: String(raw['listingId'] ?? raw['id'] ?? ''),
      listingId: String(raw['listingId'] ?? raw['id'] ?? ''),
      tokenId: raw['tokenId'] as string | number | bigint,
      quantity: (raw['quantity'] as string | number | bigint) ?? 1,
      pricePerToken: raw['pricePerToken'] as string | number | bigint,
      assetContractAddress: raw['assetContract'] as string,
      tokenType: Number(raw['tokenType'] ?? 0),
      currencyValuePerToken: raw[
        'currencyValuePerToken'
      ] as MarketplaceListingWithType['currencyValuePerToken'],
    };
  } else if (Array.isArray(listingRaw) && listingRaw.length >= 10) {
    // fallback for legacy tuple array
    listing = {
      id: listingRaw[0] as string | number | bigint,
      listingId: listingRaw[0] as string | number | bigint,
      tokenId: listingRaw[1] as string | number | bigint,
      quantity: listingRaw[2] as string | number | bigint,
      pricePerToken: listingRaw[3] as string | number | bigint,
      assetContractAddress: listingRaw[7] as string,
      tokenType: Number(listingRaw[9] ?? 0),
      currencyValuePerToken: undefined,
    };
  }

  const notFound =
    !idString ||
    idString === '0' ||
    !listingRaw ||
    listingId === 0n ||
    !listing;

  function getNftContract(addr: string) {
    if (addr.toLowerCase() === nftCollectionContract.address.toLowerCase()) {
      return nftCollectionContract;
    }
    if (
      addr.toLowerCase() === erc1155CollectionContract.address.toLowerCase()
    ) {
      return erc1155CollectionContract;
    }
    return nftCollectionContract;
  }

  const nftContract =
    listing && listing.assetContractAddress
      ? getNftContract(listing.assetContractAddress)
      : nftCollectionContract;

  const tokenId = listing?.tokenId ? BigInt(listing.tokenId) : 0n;
  const isERC1155 = listing?.tokenType === 1;

  const { data: totalSupply1155, isLoading: supplyLoading } = useReadContract({
    contract: nftContract,
    method: 'totalSupply',
    params: [tokenId],
    queryOptions: { enabled: isERC1155 && !!tokenId },
  });

  const supplyAvailable = useMemo(() => {
    const listingQty = listing?.quantity ? Number(listing.quantity) : 1;
    const onChainSupply = totalSupply1155
      ? Number(totalSupply1155)
      : listingQty;
    return isERC1155 ? Math.min(listingQty, onChainSupply) : 1;
  }, [listing?.quantity, totalSupply1155, isERC1155]);

  const [quantityToBuy, setQuantityToBuy] = useState(1);
  const account = useActiveAccount();
  const { mutate: buyNow, isPending: isBuying } = useSendTransaction();

  if (isLoading || (isERC1155 && supplyLoading)) {
    return <p>Cargando propiedad...</p>;
  }
  if (notFound) {
    return <p>Propiedad no encontrada.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <NFTProvider contract={nftContract} tokenId={tokenId}>
        <div className="rounded-xl overflow-hidden shadow-xl">
          <NFTMedia className="w-full h-96 object-cover" />
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <NFTName />
              {isERC1155 ? (
                <span className="px-2 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
                  ERC-1155
                </span>
              ) : (
                <span className="px-2 text-xs font-semibold rounded bg-green-100 text-green-700">
                  ERC-721
                </span>
              )}
            </h1>
            <p className="text-gray-600 mb-6">
              <NFTDescription />
            </p>
            <p className="text-xl font-semibold mb-3">
              Precio:{' '}
              {listing && listing.currencyValuePerToken
                ? listing.currencyValuePerToken.displayValue
                : listing
                ? Number(listing.pricePerToken) / 1e18
                : ''}{' '}
              {listing?.currencyValuePerToken?.symbol ?? ''}
            </p>
            {isERC1155 && (
              <div className="mb-4 text-purple-600 text-lg flex items-center gap-4">
                NFTs disponibles: <b>{supplyAvailable}</b>
                <span>
                  <input
                    type="number"
                    min={1}
                    max={supplyAvailable}
                    step={1}
                    value={quantityToBuy}
                    className="border rounded px-2 py-1 w-[70px] text-center"
                    onChange={(e) => {
                      let v = Number(e.target.value);
                      if (isNaN(v) || v < 1) v = 1;
                      if (v > supplyAvailable) v = supplyAvailable;
                      setQuantityToBuy(v);
                    }}
                  />
                </span>
              </div>
            )}
            <Button
              disabled={
                isBuying ||
                !account ||
                (isERC1155 &&
                  (quantityToBuy < 1 || quantityToBuy > supplyAvailable))
              }
              onClick={() => {
                const tx = prepareContractCall({
                  contract: marketplaceContract,
                  method:
                    'function buyFromListing(uint256 listingId, uint256 quantityToBuy, address recipient)',
                  params: [
                    listing && typeof listing.id === 'bigint'
                      ? listing.id
                      : listing
                      ? BigInt(listing.id)
                      : 0n,
                    isERC1155 ? BigInt(quantityToBuy) : 1n,
                    account?.address ?? '',
                  ],
                });
                buyNow(tx);
              }}
            >
              {isBuying ? 'Comprando...' : 'Comprar'}
            </Button>
          </div>
        </div>
      </NFTProvider>
    </div>
  );
}
