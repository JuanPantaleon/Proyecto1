'use client';

import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function ISGSimulator() {
  const [formData, setFormData] = useState({
    exercise: 'deadlift',
    bodyWeight: 80,
    height: 175,
    weightLifted: 150,
    reps: 5,
  });
  const [result, setResult] = useState<{ score: number; division: string; rawScore: number } | null>(null);

  const calculateISG = () => {
    // Simplified ISG calculation for demo
    const exerciseFactors: Record<string, number> = {
      deadlift: 9.75,
      squat: 9.75,
      bench: 8.0,
      ohp: 8.75,
      pullup: 8.5,
    };
    
    const factor = exerciseFactors[formData.exercise] || 8;
    const ratioFuerza = (formData.weightLifted * formData.reps * factor) / formData.bodyWeight;
    const heightFactor = 1.0 + (formData.height - 170) * 0.002;
    const rawScore = ratioFuerza * heightFactor;
    const finalScore = Math.round(rawScore * 10) / 10;
    
    let division = 'Bronce';
    if (finalScore >= 95) division = 'Elite';
    else if (finalScore >= 90) division = 'Diamante';
    else if (finalScore >= 85) division = 'Platino';
    else if (finalScore >= 80) division = 'Oro';
    else if (finalScore >= 75) division = 'Plata';
    else if (finalScore >= 70) division = 'Bronce';
    
    setResult({ score: finalScore, division, rawScore });
  };

  const projectionText = result 
    ? `+${Math.max(0, Math.round(result.score - 82.4))} ISG vs tu actual`
    : 'Completa el formulario';

  const getExerciseLabel = (exercise: string) => {
    switch (exercise) {
      case 'deadlift': return 'Peso Muerto';
      case 'squat': return 'Sentadilla';
      case 'bench': return 'Press Banca';
      case 'ohp': return 'Press Militar';
      case 'pullup': return 'Dominadas';
      default: return exercise;
    }
  };

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full mb-4 inline-block">
            SIMULADOR ISG
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Calcula tu <span className="text-red-400">Score ISG</span> Proyectado
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Ingresa tus datos y descubre en qué división caerías. La fórmula real que usa nuestra plataforma.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <Card className="bg-gray-950/50 border border-gray-800/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Configura tu Levantamiento</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ejercicio</label>
                <select 
                  value={formData.exercise}
                  onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none appearance-none"
                >
                  <option value="deadlift">Peso Muerto (Deadlift)</option>
                  <option value="squat">Sentadilla Libre (Back Squat)</option>
                  <option value="bench">Press Banca Plana</option>
                  <option value="ohp">Press Militar (Overhead Press)</option>
                  <option value="pullup">Dominadas (Pull-ups)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Peso Corporal (kg)</label>
                  <input 
                    type="number" 
                    value={formData.bodyWeight}
                    onChange={(e) => setFormData({...formData, bodyWeight: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none" 
                    placeholder="80" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none" 
                    placeholder="175" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Peso Levantado (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weightLifted}
                    onChange={(e) => setFormData({...formData, weightLifted: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none" 
                    placeholder="150" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Repeticiones</label>
                  <input 
                    type="number" 
                    value={formData.reps}
                    onChange={(e) => setFormData({...formData, reps: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none" 
                    placeholder="5" 
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl text-lg font-semibold shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                onClick={calculateISG}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calcular Score ISG
              </Button>
            </div>
          </Card>

          {/* Result Preview Card */}
          <Card className="bg-gray-950/50 border border-gray-800/50 p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl" />
            <div className="relative h-full flex flex-col items-center justify-center p-4">
              <div className="text-center w-full">
                <div className="mb-6">
                  <span className="text-amber-400 text-xl font-bold">SCORE ISG PROYECTADO</span>
                </div>
                <div className="text-7xl lg:text-9xl font-bold text-white mb-2">
                  {result?.score ?? '—'}
                </div>
                <div className="text-2xl text-amber-400 font-bold mb-6">
                  {result?.division ?? '—'}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Peso Corp.', value: `${formData.bodyWeight}kg` },
                    { label: 'Altura', value: `${formData.height}cm` },
                    { label: 'Ejercicio', value: getExerciseLabel(formData.exercise) },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 text-center">
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-amber-400/30 rounded-2xl text-center">
                  <div className="text-amber-300 text-sm font-bold mb-1">PROYECCIÓN</div>
                  <div className="text-lg font-bold text-white">
                    {projectionText}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}