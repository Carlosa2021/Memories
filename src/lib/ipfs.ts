// Utilidades de resolución IPFS con múltiples gateways y fallback

const gateways = [
  (cid: string, filename: string) =>
    `https://ipfs.thirdwebcdn.com/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://cloudflare-ipfs.com/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) => `https://ipfs.io/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://gateway.pinata.cloud/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://nftstorage.link/ipfs/${cid}/${filename}`,
];

export function resolveIPFSAll(ipfsUrl?: string): string[] {
  if (!ipfsUrl) return [];
  if (!ipfsUrl.startsWith('ipfs://')) return [ipfsUrl];
  const withoutScheme = ipfsUrl.replace('ipfs://', '');
  const [cid, ...rest] = withoutScheme.split('/');
  const filename = rest.join('/');
  return gateways.map((g) => g(cid, filename));
}

export function resolveIPFSPrimary(ipfsUrl?: string): string | undefined {
  return resolveIPFSAll(ipfsUrl)[0];
}
