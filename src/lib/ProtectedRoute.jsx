"use client"

import { useAuth } from "../context/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si requiere admin y el usuario no es admin
  if (adminOnly && user?.rol !== "admin") {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-lg mb-4">No tienes permisos para acceder a esta página</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
