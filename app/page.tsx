import { getLeaderboard } from '@/lib/elo'
import HomeClient from './home-client'

export default async function Home() {
  const leaderboard = await getLeaderboard(20)

  return <HomeClient leaderboard={leaderboard} />
}
