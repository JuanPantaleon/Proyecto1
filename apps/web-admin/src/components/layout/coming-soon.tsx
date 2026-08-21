import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

export default function ComingSoon({
  title,
  description,
  icon: Icon,
  backHref = '/dashboard',
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref?: string;
}) {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col items-center justify-center bg-black px-4 text-center text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[#FBBF24]">
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-white/40">{description}</p>
      <span className="mt-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
        En construcción
      </span>
      <Link
        href={backHref}
        className="mt-6 text-sm text-[#FBBF24] transition-opacity hover:opacity-80"
      >
        Volver al panel
      </Link>
    </div>
  );
}
