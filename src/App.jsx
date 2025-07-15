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
import CuentaCorriente from "./pages/CuentaCorriente"
import ProtectedRoute from "./lib/ProtectedRoute"
import Configuraciones from "./pages/Configuraciones"
import Proveedores from "./pages/Proveedores"
import Categorias from "./pages/Categorias"
import ReporteVentas from "./pages/ReporteVentas"
import CierreCaja from "./pages/CierreCaja"
import MovimientosTable from "./components/cuenta-corriente/MovimientosTable"
import StockMovementsHistory from "./pages/StockMovementsHistory"

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Verificando sesión...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading, initialized } = useAuth()

  // Mostrar loading solo mientras se inicializa la aplicación
  if (!initialized || loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Rutas públicas - solo accesibles si NO está autenticado */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Rutas protegidas - solo accesibles si está autenticado */}
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
      <Route
        path="/reportes/ventas"
        element={
          <ProtectedRoute adminOnly>
            <ReporteVentas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes/historial-movimientos"
        element={
          <ProtectedRoute adminOnly>
            <StockMovementsHistory />
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
        path="/cuenta-corriente"
        element={
          <ProtectedRoute adminOnly>
            <CuentaCorriente />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta-corriente/movimientos/:clienteId"
        element={
          <ProtectedRoute adminOnly>
            <MovimientosTable />
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

      {/* Ruta raíz - redirige según el estado de autenticación */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      {/* Ruta catch-all para URLs no encontradas */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
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
