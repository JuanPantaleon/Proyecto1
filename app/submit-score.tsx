"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SubmitScore() {
  const [score, setScore] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Si el usuario aún no ha cargado, mostramos un mensaje temporal
  if (!isLoaded || !user) {
    return (
      <p className="text-red-500">Cargando sesión, por favor espere...</p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: Number(score), userId: user?.id ?? "" }),
    });
    setStatus(res.ok ? "done" : "error");
    
    // Actualizar neurodas después de enviar puntuación
    await fetch("/api/neurodas/" + (user?.id ?? ""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activationLevel: 60, // Esto podría ser calculado basado en la puntuación
        resilienceScore: 55,
        focusScore: 65,
      }),
    });
    
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 flex gap-2 items-end">
      <label className="flex flex-col text-sm">
        Score
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-black text-white px-3 py-1 rounded"
      >
        Submit
      </button>
      {status === "done" && <span className="text-green-600 text-sm">Saved!</span>}
      {status === "error" && <span className="text-red-600 text-sm">Failed.</span>}
    </form>
  );
}