'use client';
import { useEffect, useMemo, useState } from 'react';
import { ownerOf } from 'thirdweb/extensions/erc721';
import { balanceOf as balanceOf1155 } from 'thirdweb/extensions/erc1155';
import {
  nftCollectionContract,
  erc1155CollectionContract,
} from '@/lib/contracts';
import { useActiveAccount } from 'thirdweb/react';

export function EncryptedMedia({
  tipo,
  tokenId,
  preview,
  children,
}: {
  tipo: 'ERC721' | 'ERC1155';
  tokenId: bigint;
  preview: React.ReactNode;
  children: React.ReactNode; // contenido “desbloqueado”
}) {
  const account = useActiveAccount();
  const [hasAccess, setHasAccess] = useState(false);

  const contract = useMemo(() => {
    return tipo === 'ERC1155'
      ? erc1155CollectionContract
      : nftCollectionContract;
  }, [tipo]);

  useEffect(() => {
    (async () => {
      if (!account) {
        setHasAccess(false);
        return;
      }
      try {
        if (tipo === 'ERC1155') {
          const bal = await balanceOf1155({
            contract: erc1155CollectionContract,
            owner: account.address,
            tokenId,
          });
          setHasAccess(bal > 0n);
        } else {
          const owner = await ownerOf({
            contract: nftCollectionContract,
            tokenId,
          });
          setHasAccess(owner.toLowerCase() === account.address.toLowerCase());
        }
      } catch {
        setHasAccess(false);
      }
    })();
  }, [account, contract, tipo, tokenId]);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none">{preview}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl bg-black/60 text-white px-4 py-2 text-sm">
          Bloqueado: conecta tu wallet o adquiere este NFT
        </div>
      </div>
    </div>
  );
}
