"use client"

import { useAuth } from "../context/AuthContext"
import {
  Car,
  Package,
  BarChart3,
  Users,
  Settings,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Shield,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Layout from "../components/Layout"

const Dashboard = () => {
  const { user } = useAuth()

  // Menús base para empleados
  const getEmployeeMenuItems = () => [
    { icon: ShoppingCart, label: "Ventas", color: "bg-green-500", description: "Registrar ventas", href: "/ventas" },
    { icon: Package, label: "Compras", color: "bg-blue-500", description: "Gestionar compras", href: "/compras" },
    {
      icon: CreditCard,
      label: "Cierre de caja",
      color: "bg-purple-500",
      description: "Cerrar caja diaria",
      href: "/cierre-caja",
    },
  ]

  // Menús adicionales solo para administradores
  const getAdminOnlyMenuItems = () => [
    { icon: Package, label: "Inventario", color: "bg-blue-500", description: "Gestionar productos", href: "/stock" },
    {
      icon: Users,
      label: "Clientes",
      color: "bg-orange-500",
      description: "Gestionar clientes",
      href: "/ajustes/clientes",
    },
    { icon: Car, label: "Repuestos", color: "bg-red-500", description: "Catálogo de repuestos", href: "/stock" },
    {
      icon: BarChart3,
      label: "Reportes",
      color: "bg-purple-500",
      description: "Análisis y reportes",
      href: "/reportes/ventas",
    },
    {
      icon: UserCheck,
      label: "Usuarios",
      color: "bg-indigo-500",
      description: "Gestionar usuarios",
      href: "/ajustes/usuarios",
    },
    {
      icon: Settings,
      label: "Configuración",
      color: "bg-gray-500",
      description: "Configuración del sistema",
      href: "/ajustes/negocio",
    },
  ]

  // Obtener menús según el rol
  const getMenuItems = () => {
    const baseItems = getEmployeeMenuItems()
    return user?.rol === "admin" ? [...baseItems, ...getAdminOnlyMenuItems()] : baseItems
  }

  const menuItems = getMenuItems()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">¡Bienvenido, {user?.nombre}!</h2>
          <p className="text-slate-600 text-lg">
            {user?.rol === "admin"
              ? "Panel de administración completo - Acceso total al sistema"
              : "Panel de empleado - Gestiona las operaciones diarias"}
          </p>
          {user?.rol === "empleado" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <UserCheck className="w-4 h-4" />
              <span>Acceso limitado: Ventas, Compras y Cierre de caja</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl border border-green-200">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Ventas del Día</p>
                  <p className="text-2xl font-bold text-slate-900">$12,450</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Compras del Mes</p>
                  <p className="text-2xl font-bold text-slate-900">$8,750</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl border border-purple-200">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Caja Actual</p>
                  <p className="text-2xl font-bold text-slate-900">$3,680</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.rol === "admin" && (
            <Card className="bg-white border border-slate-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-xl border border-orange-200">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Clientes Activos</p>
                    <p className="text-2xl font-bold text-slate-900">567</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.rol === "empleado" && (
            <Card className="bg-white border border-slate-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-xl border border-yellow-200">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Mis Ventas Hoy</p>
                    <p className="text-2xl font-bold text-slate-900">15</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => (window.location.href = item.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div
                    className={`p-4 ${item.color}/10 rounded-xl border border-slate-200 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className={`w-8 h-8 ${item.color.replace("bg-", "text-")}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors duration-300">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Actividad Reciente
            </CardTitle>
            <CardDescription className="text-slate-600">
              {user?.rol === "admin" ? "Últimas acciones en el sistema" : "Tus últimas actividades"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-slate-900">Nueva venta registrada - Filtro de aceite</span>
                </div>
                <span className="text-xs text-slate-500">Hace 5 min</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-slate-900">Compra registrada - Pastillas de freno</span>
                </div>
                <span className="text-xs text-slate-500">Hace 15 min</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-slate-900">Cierre de caja realizado</span>
                </div>
                <span className="text-xs text-slate-500">Hace 1 hora</span>
              </div>

              {user?.rol === "admin" && (
                <>
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                      <span className="text-slate-900">Stock actualizado - Amortiguadores</span>
                    </div>
                    <span className="text-xs text-slate-500">Hace 2 horas</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-slate-900">Nuevo usuario empleado creado</span>
                    </div>
                    <span className="text-xs text-slate-500">Hace 3 horas</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Only Section */}
        {user?.rol === "admin" && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-600" />
                Panel de Administrador
              </CardTitle>
              <CardDescription className="text-yellow-700">Funciones exclusivas para administradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Alertas del Sistema</h4>
                  <p className="text-sm text-slate-600">3 productos con stock bajo</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-yellow-200">
                  <Users className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Gestión de Usuarios</h4>
                  <p className="text-sm text-slate-600">5 usuarios activos</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-yellow-200">
                  <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Reportes Avanzados</h4>
                  <p className="text-sm text-slate-600">Análisis completo disponible</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee Limitations Notice */}
        {user?.rol === "empleado" && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                Panel de Empleado
              </CardTitle>
              <CardDescription className="text-blue-700">Acceso a funciones operativas principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Gestión de Ventas</h4>
                  <p className="text-sm text-slate-600">Registra y gestiona ventas</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <Package className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Control de Compras</h4>
                  <p className="text-sm text-slate-600">Registra compras de productos</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="text-slate-900 font-semibold">Cierre de Caja</h4>
                  <p className="text-sm text-slate-600">Realiza cierres diarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
