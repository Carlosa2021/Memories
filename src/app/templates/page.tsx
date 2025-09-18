'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useActiveAccount } from 'thirdweb/react';
import { sendTransaction } from 'thirdweb';
import { mintTo } from 'thirdweb/extensions/erc721';
import { nftCollectionContract } from '@/lib/contracts';

const presets = [
  {
    id: 'boda',
    name: 'Boda elegante',
    description: 'Invitación con tipografía serif y tonos dorados.',
    bg: '/images/fondo4.jpg',
    primary: '#C084FC',
  },
  {
    id: 'cumple',
    name: 'Cumpleaños divertido',
    description: 'Colores vivos y globos, ideal para fiestas.',
    bg: '/images/fondo2.jpg',
    primary: '#22C55E',
  },
  {
    id: 'ticket',
    name: 'Ticket de evento',
    description: 'Entradas modernas con QR y branding.',
    bg: '/images/fondo1.jpg',
    primary: '#60A5FA',
  },
] as const;

export default function TemplatesPage() {
  const account = useActiveAccount();
  const [selected, setSelected] = useState<(typeof presets)[number] | null>(
    null,
  );
  const [title, setTitle] = useState('Mi Evento');
  const [subtitle, setSubtitle] = useState('Sábado 21:00, Madrid');
  const [color, setColor] = useState('#4F46E5');
  const [image, setImage] = useState<File | null>(null);
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!account?.address) return alert('Conecta tu wallet');
    if (!selected) return alert('Selecciona una plantilla');

    setMinting(true);
    try {
      // Componer metadatos base a partir de la plantilla y campos.
      // Usamos file si el usuario subió imagen personalizada,
      // si no, generamos un “screenshot” básico del preset con texto como fallback (simplificado aquí).
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Fondo
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título y subtítulo
      ctx.fillStyle = color;
      ctx.font = 'bold 72px system-ui';
      ctx.fillText(title, 64, 200);
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '36px system-ui';
      ctx.fillText(subtitle, 64, 280);

      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file =
        image ?? new File([blob], 'template.png', { type: 'image/png' });

      const tx = mintTo({
        contract: nftCollectionContract,
        to: account.address,
        nft: {
          name: selected.name + ' · ' + title,
          description: selected.description + ' — ' + subtitle,
          image: file,
        },
      });
      await sendTransaction({ transaction: tx, account });
      alert('✅ NFT minteado desde plantilla');
    } catch (e) {
      console.error(e);
      alert('❌ Error minteando');
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Plantillas</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelected(p);
              setColor(p.primary);
            }}
            className={`rounded-xl overflow-hidden border ${
              selected?.id === p.id ? 'border-indigo-500' : 'border-zinc-800'
            }`}
          >
            <div className="h-40 relative">
              <Image src={p.bg} alt={p.name} fill className="object-cover" />
            </div>
            <div className="p-4 text-left">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm opacity-70">{p.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800"
            />
          </div>
          <div>
            <label className="text-sm">Subtítulo</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800"
            />
          </div>
          <div>
            <label className="text-sm">Color principal</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Imagen personalizada (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            onClick={handleMint}
            disabled={minting || !selected}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {minting ? 'Minteando...' : 'Mintear desde plantilla'}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 p-6">
          <div className="text-sm opacity-70 mb-3">Previsualización</div>
          <div className="relative h-80 bg-zinc-900 rounded-xl overflow-hidden">
            {selected ? (
              <div className="absolute inset-0 p-6">
                <div className="text-3xl font-bold" style={{ color }}>
                  {title}
                </div>
                <div className="mt-2 opacity-80">{subtitle}</div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-60">
                Elige una plantilla para ver la vista previa
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
