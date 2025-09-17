'use client';
import { useState } from 'react';
import { Bridge } from 'thirdweb';
import { prepareTransaction, sendTransaction } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client';

export default function BridgeWidget() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);

  const handleBridge = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const preparedQuote = await Bridge.Buy.prepare({
        originChainId: 1, // Ethereum
        originTokenAddress: '0xA0b86a33E6441e88C5F2712C3E9b74F5F1b8F5F5', // ETH
        destinationChainId: 137, // Polygon
        destinationTokenAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
        amount: 10_000_000n, // 0.01 ETH
        sender: account.address,
        receiver: account.address,
        client,
      });
      // Ejecutar transacciones
      for (const tx of preparedQuote.transactions) {
        const prepared = await prepareTransaction({
          client,
          account,
          chain: tx.chain,
          to: tx.to,
          data: tx.data,
          value: tx.value,
        });
        await sendTransaction({ transaction: prepared });
      }
      alert('Bridge completado!');
    } catch (error) {
      console.error(error);
      alert('Error en bridge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBridge}
      disabled={loading || !account}
      className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
    >
      {loading ? 'Bridging...' : 'Bridge ETH a Polygon'}
    </button>
  );
}
