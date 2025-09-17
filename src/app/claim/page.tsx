'use client';
import { useState, useEffect } from 'react';
import {
  createThirdwebClient,
  prepareContractCall,
  sendTransaction,
} from 'thirdweb';
import {
  ConnectEmbed,
  useActiveAccount,
  useReadContract,
} from 'thirdweb/react';
import { erc1155CollectionContract } from '@/lib/contracts';
import QRCode from 'react-qr-code';

// Objeto de configuración para Polygon
const POLYGON_CHAIN = {
  id: 137,
  rpc: 'https://polygon-rpc.com',
};

const tokenId = BigInt(0);
const tokenURI = 'ipfs://QmVK3vgu9SyGbEeCujGXYEYcLcq3fezEYah6bmSEVdqMnv/0';
const client = createThirdwebClient({
  clientId: 'fd0872a34239b21eb17ee16c7c36db9c',
});

export default function ClaimNFTPage() {
  const account = useActiveAccount();
  const [claimTx, setClaimTx] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const {
    data: userBalance,
    isLoading: loadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    contract: erc1155CollectionContract,
    method: 'balanceOf',
    params: [account?.address ?? '0x0', tokenId],
    queryOptions: { enabled: !!account?.address },
  });

  const canClaim =
    !!account?.address &&
    !loadingBalance &&
    (userBalance === undefined || Number(userBalance) < 1);

  const handleClaim = async () => {
    setClaimTx(null);
    setLoadingClaim(true);
    setError(null);
    try {
      if (!account?.address) throw new Error('Conéctate primero.');
      if (userBalance !== undefined && Number(userBalance) >= 1)
        throw new Error('Ya reclamaste tu invitación.');
      const tx = prepareContractCall({
        contract: erc1155CollectionContract,
        method:
          'function mintTo(address to, uint256 tokenId, string uri, uint256 amount)',
        params: [account.address, tokenId, tokenURI, BigInt(1)],
      });
      const result = await sendTransaction({
        transaction: tx,
        account, // Es obligatorio pasar la cuenta
      });
      setClaimTx(result.transactionHash);
      setClaimed(true);
      refetchBalance();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error desconocido al reclamar.',
      );
    } finally {
      setLoadingClaim(false);
    }
  };

  useEffect(() => {
    if (userBalance !== undefined && Number(userBalance) >= 1) {
      setClaimed(true);
    } else {
      setClaimed(false);
    }
  }, [userBalance]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Reclama tu invitación NFT
      </h2>
      <ConnectEmbed
        client={client}
        chain={POLYGON_CHAIN}
        theme="light"
        appMetadata={{
          name: 'Invitación Digital',
          url: 'https://tuboda.com',
          description: 'Reclama tu NFT para asistir a la boda.',
        }}
        accountAbstraction={{
          chain: POLYGON_CHAIN, // Usa el objeto, no el número
          sponsorGas: true,
        }}
        header={{
          title: 'NFT Invitación',
        }}
      />
      {account?.address && (
        <div className="mt-8">
          {claimed ? (
            <div className="text-center mt-6">
              <div className="text-green-600 font-bold text-xl mb-3">
                ¡Ya reclamaste tu invitación!
              </div>
              <div>
                <b>Escanea este QR para ver tu NFT:</b>
                <div className="flex justify-center mt-3">
                  <QRCode
                    value={`https://thirdweb.com/polygon/${erc1155CollectionContract.address}/erc1155/${tokenId}/?a=${account.address}`}
                    size={140}
                  />
                </div>
                <div className="mt-2">
                  <a
                    href={`https://thirdweb.com/polygon/${erc1155CollectionContract.address}/erc1155/${tokenId}/?a=${account.address}`}
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    Ver colección en thirdweb
                  </a>
                </div>
                {claimTx && (
                  <div className="mt-2">
                    <a
                      href={`https://polygonscan.com/tx/${claimTx}`}
                      className="text-xs text-blue-500 underline"
                      target="_blank"
                    >
                      Ver en Polygonscan
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                disabled={loadingClaim || !canClaim}
                className={`mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 disabled:opacity-50`}
                onClick={handleClaim}
              >
                {loadingClaim
                  ? 'Reclamando...'
                  : loadingBalance
                  ? 'Consultando...'
                  : 'Reclamar mi invitación NFT'}
              </button>
              {error && <div className="text-red-500 mt-3">{error}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
