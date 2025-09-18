'use client';
import { useAutoSign } from '@/lib/session/AutoTransactContext';

export function SessionToggle() {
  const { autoSign, setAutoSign } = useAutoSign();
  return (
    <div className="mx-auto max-w-7xl px-4 py-2 text-sm flex items-center gap-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={autoSign}
          onChange={(e) => setAutoSign(e.target.checked)}
        />
        Auto-firmar (modo 1-click)
      </label>
    </div>
  );
}
