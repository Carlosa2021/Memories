'use client';

import { useState } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { uploadToIPFS } from '@/lib/thirdweb/uploadToIPFS';
import { nftCollectionContract } from '@/lib/contracts';

export default function CreateNFTPage() {
  const [imageUri, setImageUri] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const user = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uri = await uploadToIPFS(file);
    setImageUri(uri);
    console.log('✅ URI subida:', uri);
  };

  const handleMint = async () => {
    if (!user || !imageUri) return alert('Falta imagen o wallet no conectada');

    const transaction = prepareContractCall({
      contract: nftCollectionContract,
      method: 'function mintTo(address to, string uri)',
      params: [user.address, imageUri],
    });

    await sendTransaction(transaction);

    alert('✅ NFT creado!');
    setName('');
    setDesc('');
    setImageUri('');
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Crear nuevo NFT</h1>

      <input type="file" onChange={handleUpload} className="mb-4" />

      <input
        placeholder="Nombre del NFT"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      <textarea
        placeholder="Descripción"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      <button
        onClick={handleMint}
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isPending ? 'Minteando...' : 'Mintear NFT'}
      </button>
    </div>
  );
}
