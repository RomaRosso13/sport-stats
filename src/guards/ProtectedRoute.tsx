import { Navigate } from 'react-router-dom'
import { useLeagueMembership } from '../hooks/useLeagueMembership'

function ProtectedRoute({ children, allowStaff = false }) {
  const { isStaff, isFullAdmin, loading } = useLeagueMembership()

  if (loading) return null

  const authorized = isFullAdmin || (allowStaff && isStaff)
  if (!authorized) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
