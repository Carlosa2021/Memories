import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { client } from './thirdweb/client-browser';

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

export const marketplaceContract = getContract({
  client,
  address: '0x1a15CC0d19Fddb8b2aEd851f582820988945978f', // Marketplace V3
  chain: polygon,
});
