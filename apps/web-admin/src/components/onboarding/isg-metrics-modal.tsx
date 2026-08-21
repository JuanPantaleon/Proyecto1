'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scale, Dumbbell } from 'lucide-react';
import { useRole } from '@/lib/roles';
import { api } from '@/lib/api';
import { useToastHelpers } from '@/lib/toast';

interface ISGMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ISGMetricsModal({ open, onOpenChange, onComplete }: ISGMetricsModalProps) {
  const { updatePlayerProfile } = useRole();
  const { success, error } = useToastHelpers();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSave = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!w || !h || w <= 0 || h <= 0) {
      error('Valores inválidos', 'Por favor ingresa peso y altura válidos');
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        await api.put('/api/v1/users/me', { currentWeightKg: w, heightCm: Math.round(h) });
      }
      updatePlayerProfile({ weightKg: w, heightCm: Math.round(h) });
      success('¡Perfil actualizado!', 'Tu peso y altura se guardaron correctamente. Ya podemos calcular tu ISG con precisión.');
      onComplete();
      onOpenChange(false);
    } catch {
      error('Error al guardar', 'No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="bg-[#0D0D0D] border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30">
            <Scale className="h-8 w-8 text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-bold">Completa tu perfil para ISG</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Para calcular tu Score ISG con precisión necesitamos tu peso y altura actual.
            Estos datos son privados y solo se usan para el cálculo de métricas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="weight" className="label">
              Peso actual (kg)
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="weight"
                type="number"
                step="0.1"
                min="30"
                max="200"
                placeholder="Ej: 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-12 w-full pl-10 pr-4 rounded-xl border bg-[#0D0D0D] text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="height" className="label">
              Altura (cm)
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="height"
                type="number"
                step="1"
                min="100"
                max="250"
                placeholder="Ej: 178"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="h-12 w-full pl-10 pr-4 rounded-xl border bg-[#0D0D0D] text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-3 w-full pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Luego
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-500/90 text-black"
            onClick={handleSave}
            loading={saving}
          >
            {saving ? 'Guardando...' : 'Guardar y continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}