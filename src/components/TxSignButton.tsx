'use client';
import { defineChain } from 'thirdweb/chains';
import { prepareTransaction, sendTransaction } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client';

export function TxSignButton({
  tx,
  onResult,
}: {
  tx: {
    chain_id: number;
    to: string;
    data: `0x${string}`;
    value?: string | `0x${string}`;
  };
  onResult: (hash: string, chainId: number) => void;
}) {
  const account = useActiveAccount();

  return (
    <button
      className="mt-2 px-3 py-2 rounded bg-indigo-600 text-white"
      onClick={async () => {
        const prepared = await prepareTransaction({
          client,
          chain: defineChain(tx.chain_id),
          to: tx.to,
          data: tx.data,
          value: BigInt(tx.value || '0'),
        });
        const { transactionHash, chain } = await sendTransaction({
          account: account!,
          transaction: prepared,
        });
        onResult(transactionHash, chain.id);
      }}
    >
      Firmar transacción
    </button>
  );
}
