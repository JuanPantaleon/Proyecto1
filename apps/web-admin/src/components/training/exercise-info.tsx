'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExerciseInfo({
  name,
  description,
}: {
  name: string;
  description?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const desc = description?.trim();
  if (!desc) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[10px] font-black italic leading-none text-[#FBBF24] transition-all hover:bg-[#FBBF24]/20"
        aria-label={`Ver cómo hacer ${name}`}
        title="Cómo hacerlo"
      >
        i
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md animate-fade-slide rounded-[2rem] border border-[#FBBF24]/30 bg-[#0D0D0D] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 text-lg font-bold tracking-tight text-white">{name}</h3>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5">
              {desc.split('\n').filter(Boolean).map((line, i) => {
                const isHeading = /^(c[oó]mo hacerlo|instrucciones|ejecuci[oó]n)\b/i.test(line);
                return (
                  <p
                    key={i}
                    className={cn(
                      'text-sm leading-relaxed',
                      isHeading
                        ? 'font-black uppercase tracking-widest text-[#FBBF24]'
                        : 'text-white/70'
                    )}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}