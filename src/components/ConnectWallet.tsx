'use client';

import { ConnectButton, lightTheme, darkTheme } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { client } from '@/lib/thirdweb/client';

// Configurar wallets con gas patrocinado
const wallets = [
  inAppWallet({
    auth: {
      options: [
        'email',
        'google',
        'passkey',
        'phone',
        'apple',
        'facebook',
        'discord',
        'telegram',
        'x',
        'farcaster',
        'coinbase',
      ],
    },
    metadata: {
      name: 'Memories',
      image: { src: '/logo.svg', width: 96, height: 96 },
    },
    executionMode: { mode: 'EIP7702', sponsorGas: true },
  }),
  // Wallets externos populares
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
];

// Tipa el prop correctamente aquí:
export default function ConnectWallet({ theme }: { theme?: string }) {
  const customDark = darkTheme({
    colors: {
      modalBg: '#22223b',
      accentButtonBg: '#4F46E5',
      primaryText: '#FFFFFF',
      // ...
    },
    fontFamily: 'var(--font-geist-sans)',
  });

  const customLight = lightTheme({
    // ... tu paleta light si quieres
  });

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={theme === 'dark' ? customDark : customLight}
      locale="es_ES"
    />
  );
}
