'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { mintTo } from 'thirdweb/extensions/erc721';
import { sendTransaction } from 'thirdweb';
import { nftCollectionContract } from '@/lib/contracts';
import Image from 'next/image';
import { LoaderCircle, Sparkles } from 'lucide-react';

export default function CrearNFTPage() {
  const account = useActiveAccount();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!account?.address)
      return setFeedback('⚠️ Conecta tu wallet para mintear.');
    if (!name || !description || !image)
      return setFeedback('⚠️ Completa todos los campos e imagen.');

    setLoading(true);
    try {
      const imageFile = new File([image], image.name, { type: image.type });
      const tx = mintTo({
        contract: nftCollectionContract,
        to: account.address,
        nft: { name, description, image: imageFile },
      });
      const txResult = await sendTransaction({ transaction: tx, account });
      setFeedback(
        `✅ NFT minteado con éxito. <a href="https://polygonscan.com/tx/${txResult.transactionHash}" target="_blank" rel="noopener noreferrer" class="underline text-indigo-400 hover:text-indigo-300">Ver transacción</a>`,
      );

      setName('');
      setDescription('');
      setImage(null);
      setPreview(null);
      setAiPrompt('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setFeedback('❌ Error al mintear: ' + msg);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      return setFeedback('⚠️ Introduce una idea para la IA.');
    }

    setLoadingAI(true);
    try {
      const resp = await fetch('/api/generate-nft-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await resp.json();

      setName(data.name || '');
      setDescription(data.description || '');

      if (data.imageBase64 && data.imageBase64.startsWith('data:image')) {
        const res = await fetch(data.imageBase64);
        const blob = await res.blob();
        const file = new File([blob], 'ai-nft.png', { type: 'image/png' });

        setImage(file);
        setPreview(data.imageBase64);
        setFeedback('✨ Metadata e imagen IA generadas.');
      } else {
        setFeedback('❌ No se generó la imagen.');
      }
    } catch (error) {
      console.error('Error llamando a la IA:', error);
      setFeedback('❌ Error llamando a la IA.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-white flex items-center justify-center gap-2">
        <Sparkles className="text-indigo-400 animate-pulse" /> Crear nuevo NFT
      </h1>

      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-8 border border-zinc-700">
        <div>
          <label className="block text-sm font-semibold mb-1 text-zinc-300">
            Prompt para IA
          </label>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ej: Ático de lujo con vistas al mar"
            className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
          />
          <button
            onClick={handleGenerateAI}
            disabled={loadingAI}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loadingAI ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin w-5 h-5" /> Generando...
              </span>
            ) : (
              '✨ Usar IA para generar metadata e imagen'
            )}
          </button>
        </div>

        {preview && (
          <div className="text-center">
            <Image
              src={preview}
              alt="Preview NFT"
              width={240}
              height={240}
              className="w-60 h-60 mx-auto rounded-xl border border-zinc-700 shadow-lg object-cover"
            />
            <p className="text-sm mt-2 text-zinc-500">
              Vista previa generada por IA
            </p>
          </div>
        )}

        <form onSubmit={handleMint} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-zinc-300">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-zinc-300">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-zinc-300">
              Imagen (JPG, PNG, SVG, GIF...)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="file:mr-2 file:rounded-full file:border file:px-4 file:py-1.5 file:bg-indigo-600 file:text-white"
              required={!image}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-pink-500 transition text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin w-5 h-5" /> Minteando...
              </span>
            ) : (
              '🚀 Mintear NFT'
            )}
          </button>
          {feedback && (
            <div
              className="text-center text-base font-medium text-green-400 [&_a]:underline [&_a:hover]:text-indigo-300"
              dangerouslySetInnerHTML={{ __html: feedback }}
            />
          )}
        </form>
      </div>
    </div>
  );
}
