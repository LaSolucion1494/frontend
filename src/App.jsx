"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/Dashboard"
import Ventas from "./pages/Ventas"
import Compras from "./pages/Compras"
import ReporteCompras from "./pages/ReporteCompras"
import Stock from "./pages/Stock"
import Clientes from "./pages/Clientes"
import ProtectedRoute from "./lib/ProtectedRoute"
import Configuraciones from "./pages/Configuraciones"
import Proveedores from "./pages/Proveedores"
import Categorias from "./pages/Categorias"
// Agregar la importación del componente ReporteVentas
import ReporteVentas from "./pages/ReporteVentas"
import CierreCaja from "./pages/CierreCaja"

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Rutas principales */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ventas"
        element={
          <ProtectedRoute>
            <Ventas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compras"
        element={
          <ProtectedRoute>
            <Compras />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cierre-caja"
        element={
          <ProtectedRoute>
            <CierreCaja />
          </ProtectedRoute>
        }
      />

      {/* Rutas de reportes (solo admin) */}
      <Route
        path="/reportes/compras"
        element={
          <ProtectedRoute adminOnly>
            <ReporteCompras />
          </ProtectedRoute>
        }
      />
      {/* En la sección de rutas de reportes, agregar: */}
      <Route
        path="/reportes/ventas"
        element={
          <ProtectedRoute adminOnly>
            <ReporteVentas />
          </ProtectedRoute>
        }
      />

      {/* Rutas de gestión (solo admin) */}
      <Route
        path="/stock"
        element={
          <ProtectedRoute adminOnly>
            <Stock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute adminOnly>
            <Clientes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuraciones"
        element={
          <ProtectedRoute adminOnly>
            <Configuraciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proveedores"
        element={
          <ProtectedRoute adminOnly>
            <Proveedores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <ProtectedRoute adminOnly>
            <Categorias />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
