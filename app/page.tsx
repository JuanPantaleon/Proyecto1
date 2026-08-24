import { getLeaderboard } from '@/lib/elo'
import HomeClient from './home-client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const leaderboard = await getLeaderboard(20)

  return <HomeClient leaderboard={leaderboard} />
}
