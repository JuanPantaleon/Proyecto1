"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NeurodasPage() {
  const { user, isLoaded } = useUser();
  const [neurodas, setNeurodas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) {
      router.push("/");
      return;
    }

    async function loadNeurodas() {
      const res = await fetch("/api/neurodas/" + (user?.id ?? ""));
      const data = await res.json();
      setNeurodas(data);
      setLoading(false);
    }

    loadNeurodas();
  }, [user]);

  if (loading) {
    return <p>Cargando datos neurodas...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel Neurodas</h1>
      
      {neurodas.length === 0 && (
        <p className="text-muted-opacity mb-6">
          Aún no hay datos neurodas. Envía una puntuación para comenzar.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {neurodas.map((n) => (
          <div
            key={n.id}
            className="p-4 border rounded bg-card border-border hover:transition-colors"
          >
            <h2 className="text-xl font-medium mb-2">Neuroda Session</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <p className="text-sm text-muted-opacity">Activación</p>
                <p className="text-lg font-semibold">{n.activationLevel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-opacity">Resiliencia</p>
                <p className="text-lg font-semibold">{n.resilienceScore}</p>
              </div>
              <div>
                <p className="text-sm text-muted-opacity">Enfoque</p>
                <p className="text-lg font-semibold">{n.focusScore}</p>
              </div>
            </div>
            <p className="text-xs text-muted-opacity">
              {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}