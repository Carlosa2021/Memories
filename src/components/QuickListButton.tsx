'use client';
import { useAutoSign } from '@/lib/session/AutoTransactContext';
import { marketplaceContract } from '@/lib/contracts';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction } from 'thirdweb';

export function QuickListButton({
  assetContractAddress,
  tokenId,
  pricePerToken,
  quantity = 1n,
  className,
  onDone,
}: {
  assetContractAddress: string;
  tokenId: bigint;
  pricePerToken: string;
  quantity?: bigint;
  className?: string;
  onDone?: () => void;
}) {
  const { autoSign } = useAutoSign();
  const account = useActiveAccount();

  const disabled = !pricePerToken || !account;

  const onClick = async () => {
    if (!account) return;
    const nowSec = Math.floor(Date.now() / 1000);
    const tx = prepareContractCall({
      contract: marketplaceContract,
      method:
        'function createListing((address assetContractAddress, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved, address recipient))',
      params: [
        {
          assetContractAddress,
          tokenId,
          quantity,
          currency: '0x0000000000000000000000000000000000000000',
          pricePerToken: BigInt(Math.floor(Number(pricePerToken) * 1e18)),
          startTimestamp: BigInt(nowSec),
          endTimestamp: BigInt(nowSec + 60 * 60 * 24 * 30),
          reserved: false,
          recipient: account.address,
        },
      ],
    });

    if (autoSign) {
      await sendTransaction({ account, transaction: tx });
      onDone?.();
    }
  };

  return (
    <button
      disabled={disabled}
      className={
        className ??
        'bg-green-600 text-white mt-3 px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed'
      }
      onClick={onClick}
      title={
        autoSign
          ? 'Listar ahora (1-click)'
          : 'Revisar antes de firmar (configurar)'
      }
    >
      Listar rápido
    </button>
  );
}
