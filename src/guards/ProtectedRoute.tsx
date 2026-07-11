import { Navigate } from 'react-router-dom'
import { useLeagueMembership } from '../hooks/useLeagueMembership'

function ProtectedRoute({ children }) {
  const { isMember, loading } = useLeagueMembership()

  if (loading) return null
  if (!isMember) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
