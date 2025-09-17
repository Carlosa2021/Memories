'use client';

export function SwapButton({ input }: { input: unknown }) {
  return (
    <div className="mt-2 p-3 bg-blue-100 rounded">
      <p>Swap solicitado: {JSON.stringify(input)}</p>
      <button className="mt-1 px-3 py-1 bg-blue-600 text-white rounded">
        Ejecutar Swap
      </button>
    </div>
  );
}
