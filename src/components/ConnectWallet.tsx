'use client';

import { ConnectButton, lightTheme, darkTheme } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client';

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
      theme={theme === 'dark' ? customDark : customLight}
      locale="es_ES"
    />
  );
}
