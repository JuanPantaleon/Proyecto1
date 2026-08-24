"use client";

import { useUser } from "@clerk/nextjs";
import SubmitScore from "./submit-score";
import Link from "next/link";

interface LeaderboardEntry {
  userId: string;
  name: string;
  rating: number;
}

export default function HomeClient({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Cargando sesión...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1>Ranked Fitness</h1>
        <p>La comunidad de entrenamiento más grande</p>
        <Link href="/sign-in">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Ranked Fitness</h1>
      <p>La comunidad de entrenamiento más grande</p>
      <p>Hola, {user.firstName || user.username}</p>
      <Link href="/neurodas">Ver estadísticas neuronales</Link>

      <h2>Clasificación</h2>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={entry.userId}>
            {index + 1}. {entry.name} - {entry.rating}
          </li>
        ))}
      </ul>

      <SubmitScore />
    </div>
  );
}