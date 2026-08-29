'use client';

import { Users, Zap, Target, Flame, Medal, ShieldCheck as ShieldIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const benefits = [
  { icon: Target, title: 'Score Objetivo (ISG)', desc: 'Motor matemático que cuantifica tu fuerza real sin sesgos.' },
  { icon: ShieldIcon, title: 'Validación Anti-Trampas', desc: 'Evidencia obligatoria + IA detecta repeticiones inválidas.' },
  { icon: Users, title: 'Red Social Fitness', desc: 'Feed de PRs, clanes, misiones y ranking global verificable.' },
  { icon: Zap, title: 'Rutinas IA', desc: 'Generadas según tu Score, frecuencia y debilidades detectadas.' },
  { icon: Flame, title: 'Rachas & Misiones', desc: 'Gamificación que premia la constancia, no solo la fuerza.' },
  { icon: Medal, title: 'Marketplace Coaches', desc: 'Entrenadores verificados avalan tus marcas oficialmente.' },
];

export function AboutSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1.5 border-amber-400/30 text-amber-300">
              LA VERDAD SOBRE TU RENDIMIENTO
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">
              Transforma tu entrenamiento en una experiencia <span className="text-red-400">medible</span> y <span className="text-amber-400">verificable</span>.
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Ranked Fitness no es otra app de tracking. Es un ecosistema competitivo donde cada repetición cuenta, cada marca se valida y tu posición en el ranking refleja tu fuerza real.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    'group-hover:scale-110 group-hover:rotate-3',
                    'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]'
                  )}>
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">{benefit.title}</h4>
                    <p className="text-gray-400">{benefit.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gray-950 rounded-3xl border border-gray-800/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className="relative h-full w-full p-8 flex flex-col items-center justify-center">
                <div className="relative z-10 text-center">
                  <div className="mb-8">
                    <span className="text-amber-400 text-2xl font-bold">Fórmula ISG</span>
                  </div>
                  
                  {/* Formula visualization */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 min-w-[300px]">
                      <div className="text-center p-3 bg-red-500/15 rounded-xl border border-red-500/20 min-w-[80px]">
                        <div className="text-red-400 font-bold text-xl">Peso</div>
                        <div className="text-gray-400 text-xs">kg levantados</div>
                      </div>
                      <span className="text-amber-400 text-2xl">×</span>
                      <div className="text-center p-3 bg-blue-500/15 rounded-xl border border-blue-500/20 min-w-[80px]">
                        <div className="text-blue-400 font-bold text-xl">Reps</div>
                        <div className="text-gray-400 text-xs">repeticiones</div>
                      </div>
                      <span className="text-amber-400 text-2xl">×</span>
                      <div className="text-center p-3 bg-purple-500/15 rounded-xl border border-purple-500/20 min-w-[80px]">
                        <div className="text-purple-400 font-bold text-xl">Factor</div>
                        <div className="text-gray-400 text-xs">Masa,Demanda,Complejidad,Impacto</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                      <span className="text-amber-400 text-2xl">÷</span>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-2xl border border-gray-800/50 min-w-[300px]">
                      <div className="text-center p-3 bg-green-500/15 rounded-xl border border-green-500/20 min-w-[80px]">
                        <div className="text-green-400 font-bold text-xl">Peso Corp.</div>
                        <div className="text-gray-400 text-xs">kg</div>
                      </div>
                      <span className="text-amber-400 text-2xl">×</span>
                      <div className="text-center p-3 bg-orange-500/15 rounded-xl border border-orange-500/20 min-w-[80px]">
                        <div className="text-orange-400 font-bold text-xl">Altura</div>
                        <div className="text-gray-400 text-xs">cm</div>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-4 rounded" />
                    
                    <div className="text-center p-6 bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-amber-400/30 rounded-2xl min-w-[200px]">
                      <div className="text-amber-300 text-xs font-bold tracking-wider mb-1">= SCORE ISG</div>
                      <div className="text-4xl font-bold text-white">94.7</div>
                      <div className="text-amber-400 text-sm">División Diamante</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}