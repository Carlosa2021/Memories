'use client';
import { useActiveAccount } from 'thirdweb/react';
import { getOwnedNFTs as getOwnedNFTs721 } from 'thirdweb/extensions/erc721';
import { getOwnedNFTs as getOwnedNFTs1155 } from 'thirdweb/extensions/erc1155';
import { useEffect, useState } from 'react';
import {
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
  CreateDirectListingButton,
} from 'thirdweb/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  marketplaceContract,
  nftCollectionContract,
  erc1155CollectionContract, // Nuevo: tu contrato ERC-1155, ajusta el nombre según lo tengas.
} from '@/lib/contracts';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';

interface OwnedNFT {
  id: bigint;
  tipo?: string; // 'ERC721' o 'ERC1155'
  quantityOwned?: bigint; // Sólo ERC-1155
}

export default function MisNFTsPage() {
  const account = useActiveAccount();
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingPrices, setListingPrices] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account?.address) {
        setNfts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // NFTs ERC-721
        const nfts721 = await getOwnedNFTs721({
          contract: nftCollectionContract,
          owner: account.address,
        });

        // NFTs ERC-1155
        const nfts1155 = await getOwnedNFTs1155({
          contract: erc1155CollectionContract,
          address: account.address,
          start: 0,
          count: 50,
        });

        // Añade el tipo para distinguir en el render
        const nfts721WithType = nfts721.map((nft: any) => ({
          ...nft,
          tipo: 'ERC721',
        }));

        const nfts1155WithType = nfts1155.map((nft: any) => ({
          ...nft,
          tipo: 'ERC1155',
          quantityOwned: nft.quantityOwned, // Solo para ERC1155
        }));

        // Combina ambas colecciones
        setNfts([...nfts721WithType, ...nfts1155WithType]);
      } catch (err) {
        console.error('Error al obtener NFTs:', err);
        setNfts([]);
      }
      setLoading(false);
    };
    fetchNFTs();
  }, [account?.address]);

  const handlePriceChange = (tokenId: bigint, value: string) => {
    setListingPrices((prev) => ({
      ...prev,
      [tokenId.toString()]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mis Memorias</h1>
      {loading ? (
        <div className="text-lg mt-12 text-gray-500">Cargando tus NFTs...</div>
      ) : nfts.length === 0 ? (
        <div className="mt-16 text-center text-xl font-semibold text-muted-foreground">
          No tienes Memorias en esta wallet <br />
          <span className="text-base font-normal">
            (Asegúrate de estar en la red correcta y con la wallet conectada)
          </span>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {nfts.map((nft) => (
            <NFTProvider
              contract={
                nft.tipo === 'ERC1155'
                  ? erc1155CollectionContract
                  : nftCollectionContract
              }
              tokenId={nft.id}
              key={nft.id.toString() + (nft.tipo || '')}
            >
              <Card className="rounded-2xl shadow-md hover:scale-105 bg-card dark:bg-zinc-900 transition-transform cursor-pointer overflow-hidden">
                <div className="w-full h-60 bg-card dark:bg-zinc-900">
                  <NFTMedia className="w-full h-full object-cover rounded-t-2xl bg-card dark:bg-zinc-900" />
                </div>
                <CardContent className="p-4 flex flex-col gap-2">
                  <NFTName className="text-lg font-bold truncate text-foreground" />
                  <NFTDescription className="text-xs text-muted-foreground line-clamp-2" />
                  {/* Mostrar cantidad poseída solo para ERC1155 */}
                  {nft.tipo === 'ERC1155' && nft.quantityOwned && (
                    <div className="text-xs text-purple-600">
                      Cantidad poseída: {nft.quantityOwned.toString()}
                    </div>
                  )}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Precio en POL"
                    value={listingPrices[nft.id.toString()] ?? ''}
                    onChange={(e) => handlePriceChange(nft.id, e.target.value)}
                    className="mt-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  />
                  <CreateDirectListingButton
                    contractAddress={marketplaceContract.address}
                    assetContractAddress={
                      nft.tipo === 'ERC1155'
                        ? erc1155CollectionContract.address
                        : nftCollectionContract.address
                    }
                    tokenId={nft.id}
                    chain={polygon}
                    client={client}
                    pricePerToken={
                      listingPrices[nft.id.toString()] ?? undefined
                    }
                    quantity={1n}
                    onTransactionConfirmed={() =>
                      alert('¡NFT listado para reventa!')
                    }
                    onError={(err) => alert('Error al listar: ' + err.message)}
                    disabled={!listingPrices[nft.id.toString()]}
                    className="bg-green-600 text-white mt-3 px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Listar en Marketplace
                  </CreateDirectListingButton>
                </CardContent>
              </Card>
            </NFTProvider>
          ))}
        </div>
      )}
    </div>
  );
}
