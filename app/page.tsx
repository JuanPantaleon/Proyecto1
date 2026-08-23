import { getLeaderboard } from "@/lib/elo";
import SubmitScore from "./submit-score";
import { useUser } from "@clerk/nextjs";

type AppUser = { firstName?: string; username?: string; id?: string };

export default async function Home() {
  const { user, isLoaded } = useUser();
  let userData: AppUser | null = null;

  if (isLoaded) {
    userData = user ? {
      firstName: user.firstName ?? "",
      username: user.username ?? "",
      id: user.id ?? ""
    } : null;
  }

  const leaderboard = await getLeaderboard(10);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Ranked Fitness</h1>
      {userData && (
        <p className="mb-4">Hola, {userData.firstName ?? userData.username}</p>
      )}
      {userData && (
        <a href="/neurodas" className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Ver Panel Neurodas
        </a>
      )}
      {!userData && !isLoaded && (
        <p className="mb-4">Cargando sesión...</p>
      )}
      {!userData && isLoaded && (
        <p className="mb-4">Inicia sesión para aparecer en el ranking.</p>
      )}
      <SubmitScore />
      <h2 className="text-xl font-semibold mb-2">Top 10</h2>
      <ol className="space-y-1">
        {leaderboard.map((entry) => (
          <li key={entry.userId} className="flex justify-between">
            <span>{entry.name}</span>
            <span>{entry.rating}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}