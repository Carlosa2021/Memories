'use client';
import { useActiveAccount } from 'thirdweb/react';

// TODO: Integrar un widget de bridge oficial cuando la API esté estable en thirdweb/react.
export default function BridgeWidget() {
  const account = useActiveAccount();

  return (
    <button
      disabled={!account}
      className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
      title={
        account ? 'Próximamente: Bridge entre cadenas' : 'Conecta tu wallet'
      }
    >
      Bridge (próximamente)
    </button>
  );
}
