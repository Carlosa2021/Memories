import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { client } from './thirdweb/client-browser';

// Contratos principales (con AccessControl) - para referencia
export const nftCollectionContract = getContract({
  client,
  address: '0x61819c90CBF722377Dc81166Fb73747d41b78Ad4', // NFT Collection Unicos 721
  chain: polygon,
});

export const erc1155CollectionContract = getContract({
  client,
  address: '0xE95c8B7778FE3622b6f17929F2d5D914Bdb6FD10', // NFT Collectiones Multiples 1155
  chain: polygon,
});

// CONTRATOS EDITION DROP (PARA MINTEO PÚBLICO) - USAR ESTOS ✅
export const businessCardDropContract = getContract({
  client,
  address: '0x34ED482Bc27fd544FD2d9D5f22F6069fb475Edd3', // Business Card NFT Collection (Edition Drop)
  chain: polygon,
});

export const laEstrellaDropContract = getContract({
  client,
  address: '0xceE1E726CEA1B6C9aA7A57850260224FF6bF777C', // La Estrella Entonada (Edition Drop)
  chain: polygon,
});

// Contratos principales para minteo público (sin permisos especiales)
export const nftDropContract = businessCardDropContract; // Usar Business Card para NFTs únicos
export const editionDropContract = laEstrellaDropContract; // Usar La Estrella para colecciones

export const marketplaceContract = getContract({
  client,
  address: '0x1a15CC0d19Fddb8b2aEd851f582820988945978f', // Marketplace V3
  chain: polygon,
});
