'use client';

export function MonitorBadge({ input }: { input: unknown }) {
  return (
    <div className="mt-2 p-3 bg-green-100 rounded">
      <p>Transacción monitoreada: {JSON.stringify(input)}</p>
    </div>
  );
}
