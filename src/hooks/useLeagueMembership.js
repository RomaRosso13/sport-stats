import { useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import { getUserRoleForLeague } from '../services/league_user.service'

export function useLeagueMembership() {
  const { user, loading: authLoading } = useAuth()
  const { league, loading: leagueLoading } = useLeague()

  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading || leagueLoading) return

    if (!user || !league) {
      setRole(null)
      setUserId(null)
      setChecking(false)
      return
    }

    let isMounted = true

    async function checkMembership() {
      try {
        setChecking(true)
        const membership = await getUserRoleForLeague(user.id, league.id)
        if (isMounted) {
          setRole(membership?.role || null)
          setUserId(membership?.userId || null)
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setRole(null)
          setUserId(null)
        }
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
    role,
    userId,
    isMember: !!role,
    isStaff: role === 'Staff',
    isFullAdmin: role === 'Admin' || role === 'SuperAdmin',
    loading: authLoading || leagueLoading || checking
  }
}
