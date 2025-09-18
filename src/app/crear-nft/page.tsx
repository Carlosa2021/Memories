'use client';

import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { claimTo } from 'thirdweb/extensions/erc1155';
import { sendTransaction } from 'thirdweb';
import { upload } from 'thirdweb/storage';
import { nftDropContract, editionDropContract } from '@/lib/contracts';
import { client } from '@/lib/thirdweb/client-browser';
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

  // Detecta si la IA está habilitada
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
      console.log('🚀 Iniciando proceso de minteo...');
      setFeedback('🔄 Subiendo archivos a IPFS...');

      // Subir imagen a IPFS
      const imageFile = new File([image], image.name, { type: image.type });
      console.log('📤 Subiendo imagen a IPFS...');

      const imageUri = await upload({
        client,
        files: [imageFile],
      });

      console.log('✅ Imagen subida:', imageUri);

      // Crear metadata JSON
      const metadata = {
        name,
        description,
        image: imageUri,
        attributes: [
          {
            trait_type: 'Creation Method',
            value: mode === 'ai' ? 'AI Generated' : 'Manual',
          },
          {
            trait_type: 'Type',
            value: nftType === '721' ? 'Unique NFT' : 'Edition',
          },
          {
            trait_type: 'Created',
            value: new Date().toISOString(),
          },
        ],
      };

      console.log('📤 Subiendo metadata a IPFS...');
      const metadataUri = await upload({
        client,
        files: [
          new File([JSON.stringify(metadata)], 'metadata.json', {
            type: 'application/json',
          }),
        ],
      });

      console.log('✅ Metadata subida:', metadataUri);
      setFeedback('⛽ Preparando transacción blockchain...');

      let tx;
      let contractName;
      let contractAddress;

      if (nftType === '721') {
        console.log('💎 Minteando NFT único (ERC-721)...');
        // Usar claimTo para Edition Drop (Business Card)
        tx = claimTo({
          contract: nftDropContract,
          to: account.address,
          tokenId: BigInt(0), // Token ID 0 para el drop
          quantity: BigInt(1),
        });
        contractName = 'ERC-721 (Business Card Drop)';
        contractAddress = nftDropContract.address;
      } else {
        console.log('🎨 Minteando colección (ERC-1155)...');
        // Usar claimTo para Edition Drop (La Estrella Entonada)
        tx = claimTo({
          contract: editionDropContract,
          to: account.address,
          tokenId: BigInt(0), // Token ID 0 para el drop
          quantity: BigInt(quantity),
        });
        contractName = 'ERC-1155 (La Estrella Entonada)';
        contractAddress = editionDropContract.address;
      }

      console.log('💫 Enviando transacción...');
      const txResult = await sendTransaction({ transaction: tx, account });

      setFeedback(
        `✅ <strong>¡NFT ${contractName} minteado exitosamente!</strong>${
          nftType === '1155' ? ` (${quantity} copias)` : ''
        }<br/>
        📋 Metadata: <a href="${metadataUri}" target="_blank" class="underline text-blue-400">Ver en IPFS</a><br/>
        🖼️ Imagen: <a href="${imageUri}" target="_blank" class="underline text-blue-400">Ver imagen</a><br/>
        📄 Contrato: ${contractAddress}<br/>
        🔗 <a href="https://polygonscan.com/tx/${
          txResult.transactionHash
        }" target="_blank" rel="noopener noreferrer" class="underline text-indigo-400 hover:text-indigo-300">Ver transacción en PolygonScan</a>`,
      );

      // Limpiar campos
      setName('');
      setDescription('');
      setImage(null);
      setPreview(null);
      setAiPrompt('');
      setQuantity(1);
    } catch (error: unknown) {
      console.error('❌ Error completo al mintear:', error);
      const msg = error instanceof Error ? error.message : String(error);

      if (msg.includes('upload') || msg.includes('IPFS')) {
        setFeedback('❌ Error subiendo archivos a IPFS. Verifica tu conexión.');
      } else if (
        msg.includes('claim conditions') ||
        msg.includes('no active claim')
      ) {
        setFeedback(`
          ⚠️ <strong>Claim conditions no configuradas</strong><br/>
          El contrato Edition Drop necesita condiciones de claim activas.<br/><br/>
          <strong>💡 Solución:</strong><br/>
          1️⃣ Ve a <a href="https://thirdweb.com/dashboard" target="_blank" class="text-blue-400 underline">thirdweb.com/dashboard</a><br/>
          2️⃣ Selecciona el contrato "${
            nftType === '721' ? 'Business Card' : 'La Estrella Entonada'
          }"<br/>
          3️⃣ Ve a "Claim Conditions" y configura una condición activa<br/>
          4️⃣ Establece precio, fecha y límites de minteo
        `);
      } else if (msg.includes('insufficient funds')) {
        setFeedback(
          '❌ Fondos insuficientes para pagar el gas. Necesitas más MATIC.',
        );
      } else if (msg.includes('user rejected')) {
        setFeedback('⚠️ Transacción cancelada por el usuario.');
      } else {
        setFeedback(
          `❌ Error inesperado: ${msg}<br/>Revisa la consola para más detalles.`,
        );
      }
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
        setFeedback('✨ Metadata e imagen generadas exitosamente por IA.');
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
        {/* Información de contratos */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Contratos Edition Drop (Minteo Público)
          </h3>
          <div className="text-xs text-blue-200 space-y-1">
            <div>
              🎯 ERC-721: Business Card ({nftDropContract.address.slice(0, 6)}
              ...{nftDropContract.address.slice(-4)})
            </div>
            <div>
              🎨 ERC-1155: La Estrella Entonada (
              {editionDropContract.address.slice(0, 6)}...
              {editionDropContract.address.slice(-4)})
            </div>
          </div>
        </div>

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
              <div className="text-sm opacity-80">
                NFT único (Business Card Drop)
              </div>
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
                Colección (La Estrella Drop)
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
              IA no configurada. Puedes crear NFTs en modo Manual.
            </span>
          )}
        </div>

        {mode === 'ai' && (
          <div>
            <label className="block text-sm font-semibold mb-1 text-zinc-300">
              Prompt para IA
            </label>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ej: Paisaje montañoso con lago cristalino"
              className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
            />
            <button
              onClick={handleGenerateAI}
              disabled={loadingAI || !aiEnabled}
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
        )}

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
              className="text-center text-sm font-medium text-green-400 [&_a]:underline [&_a:hover]:text-indigo-300"
              dangerouslySetInnerHTML={{ __html: feedback }}
            />
          )}
        </form>
      </div>
    </div>
  );
}
