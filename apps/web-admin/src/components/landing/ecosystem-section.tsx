'use client';

import { Zap, Trophy, Target, Users, Pause, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const features = [
  { icon: Zap, title: 'Rutinas Inteligentes (IA)', desc: 'Generadas según tu Score ISG, frecuencia semanal y debilidades detectadas automáticamente.' },
  { icon: Trophy, title: 'Detección Automática de PRs', desc: 'El sistema detecta y valida nuevos récords en tiempo real al registrar tus sets.' },
  { icon: Target, title: 'Misiones Semanales', desc: 'Objetivos dinámicos personalizados: volumen, frecuencia, ejercicios débiles, rachas.' },
  { icon: Users, title: 'Clanes y Matchmaking', desc: 'Únete o crea clanes. Compite en ligas privadas. Matchmaking por nivel ISG similar.' },
];

export function EcosystemSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-video bg-gray-950 rounded-3xl border border-gray-800/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="w-full max-w-md mx-auto">
                  {/* Timer Mockup */}
                  <Card className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-gray-400 text-sm">DESCANSO</span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-full">ACTIVO</span>
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-7xl font-bold text-red-400 font-mono tracking-tight">2:47</div>
                      <div className="text-gray-400 text-sm">Set 3 de 5 • Peso Muerto 200kg</div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <button className="w-14 h-14 rounded-full border border-gray-700 hover:bg-gray-800 flex items-center justify-center">
                        <RotateCcw className="h-6 w-6" />
                      </button>
                      <button className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center">
                        <Pause className="h-6 w-6" />
                      </button>
                      <button className="w-14 h-14 rounded-full border border-gray-700 hover:bg-gray-800 flex items-center justify-center">
                        <RotateCcw className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mt-6 text-center text-gray-500 text-sm">
                      Set 4 en 2:47 • Objetivo: 200kg × 5
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
              ECOSISTEMA COMPETITIVO
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Funciones únicas que <span className="text-red-400">nadie más ofrece</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Hemos construido el ecosistema más completo para atletas serios. Cada función está diseñada para darte ventaja competitiva real.
            </p>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-4 group p-4 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/15 text-red-400 group-hover:bg-red-500/25 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}