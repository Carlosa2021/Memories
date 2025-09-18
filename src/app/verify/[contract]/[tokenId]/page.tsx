'use client';
import { useParams } from 'next/navigation';
import { ownerOf } from 'thirdweb/extensions/erc721';
import { getContract } from 'thirdweb';
import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';

export default function VerifyPage() {
  const params = useParams<{ contract: string; tokenId: string }>();
  const account = useActiveAccount();
  const [owner, setOwner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const contract = getContract({
          client,
          address: params.contract,
          chain: polygon,
        });
        const currentOwner = await ownerOf({
          contract,
          tokenId: BigInt(params.tokenId),
        });
        setOwner(currentOwner);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error verificando';
        setError(msg);
      }
    })();
  }, [params.contract, params.tokenId]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 rounded-xl border bg-white/80 dark:bg-zinc-900/60">
      <h1 className="text-2xl font-bold mb-4">Verificación de Ticket</h1>
      <p className="text-sm opacity-70 mb-6">Contrato: {params.contract}</p>
      <p className="text-sm opacity-70 mb-6">Token ID: {params.tokenId}</p>
      {error && <p className="text-red-600">{error}</p>}
      {owner && (
        <div className="mt-4">
          <p className="text-sm">Propietario actual:</p>
          <p className="font-mono break-all">{owner}</p>
          {account?.address?.toLowerCase() === owner.toLowerCase() ? (
            <p className="mt-2 text-green-600">
              La wallet conectada es la propietaria ✅
            </p>
          ) : (
            <p className="mt-2 text-yellow-600">
              La wallet conectada no es la propietaria
            </p>
          )}
        </div>
      )}
    </div>
  );
}
