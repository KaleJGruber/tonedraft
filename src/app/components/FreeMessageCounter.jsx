
"use client";

export function FreeMessageCounter({ used }) {
  const max = 5;
  const percent = (used / max) * 100;

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between mb-1 text-sm text-gray-600">
        <span>Free messages</span>
        <span>{used} / {max}</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
