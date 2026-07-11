import { useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import { userBelongsToLeague } from '../services/league_user.service'

export function useLeagueMembership() {
  const { user, loading: authLoading } = useAuth()
  const { league, loading: leagueLoading } = useLeague()

  const [isMember, setIsMember] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading || leagueLoading) return

    if (!user || !league) {
      setIsMember(false)
      setChecking(false)
      return
    }

    let isMounted = true

    async function checkMembership() {
      try {
        setChecking(true)
        const belongs = await userBelongsToLeague(user.id, league.id)
        if (isMounted) setIsMember(belongs)
      } catch (err) {
        console.error(err)
        if (isMounted) setIsMember(false)
      } finally {
        if (isMounted) setChecking(false)
      }
    }

    checkMembership()

    return () => {
      isMounted = false
    }
  }, [user?.id, league?.id, authLoading, leagueLoading])

  return {
    isMember,
    loading: authLoading || leagueLoading || checking
  }
}
