import { Navigate } from 'react-router-dom'
import { useLeagueMembership } from '../hooks/useLeagueMembership'

function ProtectedRoute({ children, allowReferee = false, allowPhotographer = false, allowCoach = false }) {
  const { isReferee, isFullAdmin, isPhotographer, isCoach, loading } = useLeagueMembership()

  if (loading) return null

  const authorized = isFullAdmin || (allowReferee && isReferee) || (allowPhotographer && isPhotographer) || (allowCoach && isCoach)
  if (!authorized) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
