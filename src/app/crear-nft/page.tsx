'use client';

import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { mintTo } from 'thirdweb/extensions/erc721';
import { mintTo as mintTo1155 } from 'thirdweb/extensions/erc1155';
import { sendTransaction } from 'thirdweb';
import {
  nftCollectionContract,
  erc1155CollectionContract,
} from '@/lib/contracts';
import Image from 'next/image';
import { LoaderCircle, Sparkles, Info } from 'lucide-react';

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
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [nftType, setNftType] = useState<'721' | '1155'>('721');
  const [quantity, setQuantity] = useState(1);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);

  // Detecta si la IA está habilitada (no bloquear el flujo manual)
  useEffect(() => {
    const checkAI = async () => {
      try {
        const response = await fetch('/api/generate-nft-metadata');
        const data = await response.json();
        setAiEnabled(Boolean(data.enabled));
        console.log(
          '✅ Estado de IA:',
          data.enabled ? 'Activada' : 'Desactivada',
        );
      } catch (error) {
        console.error('❌ Error verificando IA:', error);
        setAiEnabled(false);
      }
    };
    checkAI();
  }, []);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!account?.address) {
      return setFeedback('⚠️ Conecta tu wallet para mintear.');
    }

    if (!name || !description || !image) {
      return setFeedback('⚠️ Completa todos los campos e imagen.');
    }

    setLoading(true);

    try {
      const imageFile = new File([image], image.name, { type: image.type });

      let tx;
      let contractName;

      if (nftType === '721') {
        // Mintear ERC-721 (NFT único)
        tx = mintTo({
          contract: nftCollectionContract,
          to: account.address,
          nft: { name, description, image: imageFile },
        });
        contractName = 'ERC-721';
      } else {
        // Mintear ERC-1155 (Colección múltiple)
        tx = mintTo1155({
          contract: erc1155CollectionContract,
          to: account.address,
          nft: { name, description, image: imageFile },
          supply: BigInt(quantity),
        });
        contractName = 'ERC-1155';
      }

      const txResult = await sendTransaction({ transaction: tx, account });

      setFeedback(
        `✅ NFT ${contractName} minteado con éxito${
          nftType === '1155' ? ` (${quantity} copias)` : ''
        }. <a href="https://polygonscan.com/tx/${
          txResult.transactionHash
        }" target="_blank" rel="noopener noreferrer" class="underline text-indigo-400 hover:text-indigo-300">Ver transacción</a>`,
      );

      setName('');
      setDescription('');
      setImage(null);
      setPreview(null);
      setAiPrompt('');
      setQuantity(1);
    } catch (error: unknown) {
      console.error('❌ Error al mintear:', error);
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
    setFeedback('🤖 Generando con IA...');

    try {
      console.log('🚀 Llamando a la API de IA con prompt:', aiPrompt);

      const resp = await fetch('/api/generate-nft-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || `Error HTTP: ${resp.status}`);
      }

      const data = await resp.json();
      console.log('✅ Respuesta de la IA:', data);

      setName(data.name || '');
      setDescription(data.description || '');

      if (data.imageBase64 && data.imageBase64.startsWith('data:image')) {
        const res = await fetch(data.imageBase64);
        const blob = await res.blob();
        const file = new File([blob], 'ai-nft.png', { type: 'image/png' });

        setImage(file);
        setPreview(data.imageBase64);
        setFeedback('✨ Metadata e imagen IA generadas exitosamente.');
      } else {
        setFeedback('❌ No se generó la imagen correctamente.');
      }
    } catch (error) {
      console.error('❌ Error llamando a la IA:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setFeedback(`❌ Error de IA: ${errorMsg}`);
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
        {/* Selector de tipo de NFT */}
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-600">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" />
            Tipo de NFT
          </h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setNftType('721')}
              className={`flex-1 p-3 rounded-lg border text-left ${
                nftType === '721'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:border-zinc-500'
              }`}
            >
              <div className="font-semibold">ERC-721</div>
              <div className="text-sm opacity-80">NFT único e irrepetible</div>
            </button>
            <button
              type="button"
              onClick={() => setNftType('1155')}
              className={`flex-1 p-3 rounded-lg border text-left ${
                nftType === '1155'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:border-zinc-500'
              }`}
            >
              <div className="font-semibold">ERC-1155</div>
              <div className="text-sm opacity-80">
                Colección con múltiples copias
              </div>
            </button>
          </div>

          {nftType === '1155' && (
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1 text-zinc-300">
                Cantidad de copias
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
          )}
        </div>

        {/* Selector de modo */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`px-3 py-1.5 rounded-lg border ${
                mode === 'manual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              Modo Manual
            </button>
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`px-3 py-1.5 rounded-lg border ${
                mode === 'ai'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              disabled={!aiEnabled}
              title={aiEnabled ? 'Usar IA' : 'IA no disponible'}
            >
              Modo IA
            </button>
          </div>
          {!aiEnabled && (
            <span className="text-xs text-yellow-400">
              IA no configurada. Puedes crear NFTs en modo Manual sin problema.
            </span>
          )}
        </div>

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
            disabled={loadingAI || !aiEnabled || mode !== 'ai'}
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
