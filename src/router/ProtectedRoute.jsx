import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  const roleMap = {
    'admin': 1,
    'user': 0
  }

  if (requiredRole && user.role !== roleMap[requiredRole]) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute
