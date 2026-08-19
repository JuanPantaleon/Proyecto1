'use client';

import Link from 'next/link';
import { Calculator, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillars = [
  {
    icon: Calculator,
    title: 'Score Objetivo (ISG)',
    desc: 'Motor matemático que cuantifica tu fuerza real sin sesgos. Fórmula propietaria: (Peso × Reps × Factor) / Peso Corporal × Altura.',
    color: 'red',
    href: '/simulador',
  },
  {
    icon: ShieldCheck,
    title: 'Validación Anti-Trampas',
    desc: 'Evidencia obligatoria (video/foto) + IA detecta rango de movimiento, tempo y repeticiones inválidas. Comunidad audita.',
    color: 'red',
    href: '/validacion',
  },
  {
    icon: Users,
    title: 'Red Social Fitness',
    desc: 'Feed de PRs verificados, clanes, misiones semanales, ranking global por división y feed social con evidencia real.',
    color: 'amber',
    href: '/social',
  },
];

export function BentoPillars() {
  return (
    <section className="relative py-24 -mt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <Link
              key={i}
              href={pillar.href}
              className={cn(
                'relative group p-8 rounded-3xl overflow-hidden transition-all duration-500',
                'bg-gradient-to-br from-gray-900/80 to-gray-950/60',
                'backdrop-blur-xl border border-gray-800/50',
                'hover:border-red-500/30 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] hover:scale-[1.01]',
                pillar.color === 'amber' && 'hover:border-amber-400/30 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]'
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
                  'group-hover:scale-110 group-hover:rotate-3',
                  pillar.color === 'red' 
                    ? 'bg-red-500/15 text-red-400 group-hover:bg-red-500/25 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                )}>
                  <pillar.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{pillar.desc}</p>
                <div className="flex items-center gap-2 text-red-400 font-medium group-hover:gap-4 transition-all">
                  <span>Explorar</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}