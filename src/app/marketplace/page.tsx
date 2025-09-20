'use client';

import { useEffect, useState } from 'react';
import { getAllListings } from 'thirdweb/extensions/marketplace';
import {
  marketplaceContract,
  nftCollectionContract,
  erc1155CollectionContract, // importa tu contrato 1155
} from '@/lib/contracts';
import { NFTCard } from '@/components/ui/NFTCard';
import BuyFundsWidget from '@/components/BuyFundsWidget';
import BridgeWidget from '@/components/BridgeWidget';
import type { DirectListing } from 'thirdweb/extensions/marketplace';

export default function MarketplacePage() {
  const [listings, setListings] = useState<DirectListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'recent' | 'low-high' | 'high-low'>(
    'recent',
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await getAllListings({
          contract: marketplaceContract,
          start: 0,
          count: 50n,
        });
        setListings(data as DirectListing[]);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, []);

  // Detecta la colección a la que pertenece el NFT
  function getCollectionContract(assetContractAddress: string) {
    if (
      assetContractAddress.toLowerCase() ===
      nftCollectionContract.address.toLowerCase()
    ) {
      return nftCollectionContract;
    }
    if (
      assetContractAddress.toLowerCase() ===
      erc1155CollectionContract.address.toLowerCase()
    ) {
      return erc1155CollectionContract;
    }
    return null;
  }

  // Filtrado y ordenamiento exactamente igual
  const filteredListings = listings
    .filter(
      (l) =>
        (l.asset?.metadata?.name?.toLowerCase() ?? '').includes(
          search.toLowerCase(),
        ) ||
        (l.asset?.metadata?.description?.toLowerCase() ?? '').includes(
          search.toLowerCase(),
        ),
    )
    .sort((a, b) => {
      if (sort === 'low-high') {
        return (
          Number(a.currencyValuePerToken.value) -
          Number(b.currencyValuePerToken.value)
        );
      } else if (sort === 'high-low') {
        return (
          Number(b.currencyValuePerToken.value) -
          Number(a.currencyValuePerToken.value)
        );
      }
      return Number(b.startTimeInSeconds) - Number(a.startTimeInSeconds);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900">
      {/* Hero Section Minimalista con Clase */}
      <section className="gradient-hero-memories text-gray-900 dark:text-white py-20 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Mercado de Memorias NFT
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed opacity-90">
            Descubre y adquiere NFTs únicos para tus momentos especiales. Crea,
            colecciona y comparte recuerdos eternos.
          </p>
        </div>
      </section>

      {/* Controles de Búsqueda y Ordenamiento con Estilo Premium */}
      <section className="max-w-7xl mx-auto mt-12 px-4 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            placeholder="Buscar NFT por nombre o descripción"
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg placeholder-gray-500 transition-all duration-300"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as 'recent' | 'low-high' | 'high-low')
          }
          className="px-6 py-4 border-0 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg cursor-pointer transition-all duration-300"
        >
          <option value="recent">Agregados recientemente</option>
          <option value="low-high">Precio: de menor a mayor</option>
          <option value="high-low">Precio: de mayor a menor</option>
        </select>
        {/* Toggle Vista */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Sección de Listados con Grid Elegante */}
      <section id="listings" className="max-w-7xl mx-auto mt-16 px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 tracking-wide">
          Colección Destacada
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-4 text-lg text-gray-600">Cargando memorias...</p>
          </div>
        ) : (
          <div
            className={`grid gap-8 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredListings.map((listing) => {
              const contract = getCollectionContract(
                listing.assetContractAddress,
              );
              if (!contract) return null;
              return (
                <div
                  key={listing.id.toString()}
                  className={`transform hover:scale-105 transition-transform duration-300 ${
                    viewMode === 'list' ? 'flex items-center gap-6' : ''
                  }`}
                >
                  <NFTCard
                    listingId={Number(listing.id)}
                    tokenId={Number(listing.tokenId)}
                    contract={contract}
                    price={`${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sección de Funding */}
      <section className="max-w-7xl mx-auto mt-16 px-4 py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">
          Obtén Fondos para Comprar
        </h2>
        <div className="flex justify-center gap-4">
          <BuyFundsWidget />
          <BridgeWidget />
        </div>
      </section>
    </div>
  );
}
