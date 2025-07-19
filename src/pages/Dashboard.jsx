"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
  RefreshCw,
  ScanLine,
  Clock,
  CheckCircle2,
  ArrowRight,
  Barcode,
  Store,
  CreditCard,
  FileText,
  Activity,
  Type,
  X,
} from "lucide-react"
import { formatCurrency, formatDate } from "../lib/utils"
import { useDashboard } from "../hooks/useDashboard"
import { useProducts } from "../hooks/useProducts"
import { Loading } from "../components/ui/loading"
import ProductQuickSearchModal from "../components/dashboard/ProductQuickSearchModal"
import { useAuth } from "../context/AuthContext"

const Dashboard = () => {
  const navigate = useNavigate()

  // Auth context
  const { user } = useAuth()

  const codeSearchInputRef = useRef(null)
  const nameSearchInputRef = useRef(null)

  // Estados locales para búsqueda por código
  const [codeSearchTerm, setCodeSearchTerm] = useState("")
  const [codeSearchResults, setCodeSearchResults] = useState([])
  const [codeSearchLoading, setCodeSearchLoading] = useState(false)

  // Estados locales para búsqueda por nombre/descripción
  const [nameSearchTerm, setNameSearchTerm] = useState("")
  const [nameSearchResults, setNameSearchResults] = useState([])
  const [nameSearchLoading, setNameSearchLoading] = useState(false)

  // Estados para modal
  const [isQuickSearchModalOpen, setIsQuickSearchModalOpen] = useState(false)
  const [modalSearchResults, setModalSearchResults] = useState([])
  const [modalSearchTerm, setModalSearchTerm] = useState("")
  const [modalSearchType, setModalSearchType] = useState("") // "code" o "name"

  // Hooks personalizados
  const { stats, recentSales, lowStockProducts, loading: dashboardLoading, fetchDashboardData } = useDashboard()

  const { searchProducts } = useProducts()

  // Cargar datos del dashboard al montar
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Función para búsqueda rápida por código - CORREGIDA
  const handleCodeSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setCodeSearchResults([])
      return
    }

    setCodeSearchLoading(true)
    try {
      console.log("Buscando por código:", searchTerm)

      // Usar la función de búsqueda con filtros específicos para códigos
      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 15,
      })

      console.log("Resultado búsqueda código:", searchResult)

      if (searchResult.success) {
        // Filtrar y priorizar coincidencias de código
        const codeMatches = searchResult.data
          .filter((product) => product.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
          .sort((a, b) => {
            // Priorizar coincidencias exactas
            const aExact = a.codigo.toLowerCase() === searchTerm.toLowerCase()
            const bExact = b.codigo.toLowerCase() === searchTerm.toLowerCase()
            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1

            // Luego priorizar coincidencias que empiecen con el término
            const aStarts = a.codigo.toLowerCase().startsWith(searchTerm.toLowerCase())
            const bStarts = b.codigo.toLowerCase().startsWith(searchTerm.toLowerCase())
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1

            return 0
          })

        console.log("Coincidencias de código encontradas:", codeMatches.length)
        setCodeSearchResults(codeMatches)
      } else {
        console.error("Error en búsqueda por código:", searchResult.message)
        setCodeSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por código:", error)
      setCodeSearchResults([])
    } finally {
      setCodeSearchLoading(false)
    }
  }

  // Función para búsqueda rápida por nombre/descripción - CORREGIDA
  const handleNameSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setNameSearchResults([])
      return
    }

    setNameSearchLoading(true)
    try {
      console.log("Buscando por nombre:", searchTerm)

      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 20,
      })

      console.log("Resultado búsqueda nombre:", searchResult)

      if (searchResult.success) {
        // Filtrar productos que coincidan en nombre, descripción o marca (excluyendo solo códigos)
        const nameMatches = searchResult.data
          .filter((product) => {
            const term = searchTerm.toLowerCase()
            const matchesName = product.nombre.toLowerCase().includes(term)
            const matchesDescription = product.descripcion && product.descripcion.toLowerCase().includes(term)
            const matchesBrand = product.marca && product.marca.toLowerCase().includes(term)
            const matchesCode = product.codigo.toLowerCase().includes(term)

            // Incluir si coincide en nombre, descripción o marca
            // También incluir si coincide en código, pero dar prioridad a nombre/descripción/marca
            return matchesName || matchesDescription || matchesBrand || matchesCode
          })
          .sort((a, b) => {
            const term = searchTerm.toLowerCase()

            // Priorizar coincidencias exactas en nombre
            const aNameExact = a.nombre.toLowerCase() === term
            const bNameExact = b.nombre.toLowerCase() === term
            if (aNameExact && !bNameExact) return -1
            if (!aNameExact && bNameExact) return 1

            // Luego priorizar nombres que empiecen con el término
            const aNameStarts = a.nombre.toLowerCase().startsWith(term)
            const bNameStarts = b.nombre.toLowerCase().startsWith(term)
            if (aNameStarts && !bNameStarts) return -1
            if (!aNameStarts && bNameStarts) return 1

            // Finalmente ordenar alfabéticamente
            return a.nombre.localeCompare(b.nombre)
          })

        console.log("Coincidencias de nombre encontradas:", nameMatches.length)
        setNameSearchResults(nameMatches)
      } else {
        console.error("Error en búsqueda por nombre:", searchResult.message)
        setNameSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por nombre:", error)
      setNameSearchResults([])
    } finally {
      setNameSearchLoading(false)
    }
  }

  // Debounce mejorado y más responsivo
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (codeSearchTerm.trim()) {
        handleCodeSearch(codeSearchTerm)
      } else {
        setCodeSearchResults([])
      }
    }, 200) // Reducido para mejor responsividad

    return () => clearTimeout(timeoutId)
  }, [codeSearchTerm])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nameSearchTerm.trim()) {
        handleNameSearch(nameSearchTerm)
      } else {
        setNameSearchResults([])
      }
    }, 300) // Ligeramente más lento para nombres

    return () => clearTimeout(timeoutId)
  }, [nameSearchTerm])

  // Función para abrir el modal con resultados de código
  const openCodeSearchModal = () => {
    setModalSearchResults(codeSearchResults)
    setModalSearchTerm(codeSearchTerm)
    setModalSearchType("code")
    setIsQuickSearchModalOpen(true)
  }

  // Función para abrir el modal con resultados de nombre
  const openNameSearchModal = () => {
    setModalSearchResults(nameSearchResults)
    setModalSearchTerm(nameSearchTerm)
    setModalSearchType("name")
    setIsQuickSearchModalOpen(true)
  }

  // Función para manejar Enter en búsqueda por código
  const handleCodeSearchKeyDown = (e) => {
    if (e.key === "Enter" && codeSearchResults.length > 0) {
      openCodeSearchModal()
    }
  }

  // Función para manejar Enter en búsqueda por nombre
  const handleNameSearchKeyDown = (e) => {
    if (e.key === "Enter" && nameSearchResults.length > 0) {
      openNameSearchModal()
    }
  }

  // Función para limpiar búsquedas
  const clearSearches = () => {
    setCodeSearchTerm("")
    setNameSearchTerm("")
    setCodeSearchResults([])
    setNameSearchResults([])
  }

  // Función para obtener el color del estado de stock
  const getStockStatusColor = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "text-red-600 bg-red-50 border-red-200"
    if (product.stock <= stockMinimo) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  // Función para obtener el texto del estado de stock
  const getStockStatusText = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "Sin stock"
    if (product.stock <= stockMinimo) return "Stock bajo"
    return "Disponible"
  }

  // Función para resaltar el término de búsqueda en el nombre del producto
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  if (dashboardLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando dashboard..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Bienvenido {user?.nombre ? `${user.nombre}` : "al Dashboard"}
                </h1>
                <p className="text-muted-foreground mt-2">Sistema de gestión de repuestos</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchDashboardData()} variant="outline" disabled={dashboardLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${dashboardLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button onClick={() => navigate("/ventas")} className="bg-slate-800 hover:bg-slate-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Venta
                </Button>
              </div>
            </div>
          </div>

          {/* Buscador Rápido de Productos - VERSIÓN MEJORADA */}
          <Card className="mb-8 border-2 border-slate-800 shadow-lg">
            <CardHeader className="bg-slate-800 text-white">
              <CardTitle className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5" />
                Búsqueda Rápida de Productos
              </CardTitle>
              <CardDescription className="text-slate-200">
                Busca productos de forma instantánea mientras escribes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Inputs de búsqueda lado a lado - MEJORADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Búsqueda por Código */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Barcode className="w-4 h-4" />
                      Búsqueda por Código
                    </div>
                    <div className="relative">
                      <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        ref={codeSearchInputRef}
                        placeholder="Escribe o escanea el código..."
                        value={codeSearchTerm}
                        onChange={(e) => setCodeSearchTerm(e.target.value)}
                        onKeyDown={handleCodeSearchKeyDown}
                        className="pl-12 pr-12 h-12 text-lg border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
                        autoComplete="off"
                      />
                      {codeSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Resultados de código en tiempo real */}
                    {codeSearchResults.length > 0 && (
                      <div className="border rounded-lg bg-white shadow-sm max-h-64 overflow-y-auto">
                        <div className="p-2 bg-blue-50 border-b">
                          <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {codeSearchResults.length} código{codeSearchResults.length !== 1 ? "s" : ""} encontrado
                            {codeSearchResults.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="divide-y">
                          {codeSearchResults.slice(0, 3).map((product) => (
                            <div
                              key={`code-${product.id}`}
                              className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-sm font-medium bg-blue-100 px-2 py-1 rounded text-blue-800">
                                      {product.codigo}
                                    </span>
                                    <Badge variant="outline" className={getStockStatusColor(product)}>
                                      {getStockStatusText(product)}
                                    </Badge>
                                  </div>
                                  <h4 className="font-semibold text-slate-900 text-sm">{product.nombre}</h4>
                                  <p className="text-xs text-slate-600 mt-1">
                                    Stock: {product.stock} | {product.marca || "Sin marca"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-green-600">
                                    {formatCurrency(product.precio_venta)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {codeSearchResults.length > 3 && (
                          <div className="p-2 bg-slate-50 border-t text-center">
                            <Button
                              onClick={openCodeSearchModal}
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                            >
                              Ver todos ({codeSearchResults.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {codeSearchTerm && codeSearchResults.length === 0 && !codeSearchLoading && (
                      <div className="text-center py-3 text-slate-500 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-400" />
                        <p className="text-sm font-medium text-red-700">Código no encontrado</p>
                        <p className="text-xs text-red-600">"{codeSearchTerm}"</p>
                      </div>
                    )}
                  </div>

                  {/* Búsqueda por Nombre/Descripción */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Type className="w-4 h-4" />
                      Búsqueda por Nombre/Descripción
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        ref={nameSearchInputRef}
                        placeholder="Escribe el nombre del producto..."
                        value={nameSearchTerm}
                        onChange={(e) => setNameSearchTerm(e.target.value)}
                        onKeyDown={handleNameSearchKeyDown}
                        className="pl-12 pr-12 h-12 text-lg border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
                        autoComplete="off"
                      />
                      {nameSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Resultados de nombre en tiempo real */}
                    {nameSearchResults.length > 0 && (
                      <div className="border rounded-lg bg-white shadow-sm max-h-64 overflow-y-auto">
                        <div className="p-2 bg-green-50 border-b">
                          <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                            <Type className="w-3 h-3" />
                            {nameSearchResults.length} producto{nameSearchResults.length !== 1 ? "s" : ""} encontrado
                            {nameSearchResults.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="divide-y">
                          {nameSearchResults.slice(0, 4).map((product) => (
                            <div
                              key={`name-${product.id}`}
                              className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                                      {product.codigo}
                                    </span>
                                    <Badge variant="outline" className={getStockStatusColor(product)}>
                                      {getStockStatusText(product)}
                                    </Badge>
                                  </div>
                                  <h4 className="font-semibold text-slate-900 text-sm">
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: highlightSearchTerm(product.nombre, nameSearchTerm),
                                      }}
                                    />
                                  </h4>
                                  {product.descripcion && product.descripcion !== "Sin Descripción" && (
                                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: highlightSearchTerm(product.descripcion, nameSearchTerm),
                                        }}
                                      />
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-500 mt-1">
                                    Stock: {product.stock} | {product.marca || "Sin marca"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-green-600">
                                    {formatCurrency(product.precio_venta)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {nameSearchResults.length > 4 && (
                          <div className="p-2 bg-slate-50 border-t text-center">
                            <Button
                              onClick={openNameSearchModal}
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                            >
                              Ver todos ({nameSearchResults.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {nameSearchTerm &&
                      nameSearchTerm.length >= 1 &&
                      nameSearchResults.length === 0 &&
                      !nameSearchLoading && (
                        <div className="text-center py-3 text-slate-500 bg-orange-50 rounded-lg border border-orange-200">
                          <Package className="w-6 h-6 mx-auto mb-1 text-orange-400" />
                          <p className="text-sm font-medium text-orange-700">Sin resultados</p>
                          <p className="text-xs text-orange-600">"{nameSearchTerm}"</p>
                        </div>
                      )}

                    {nameSearchTerm && nameSearchTerm.length < 1 && (
                      <div className="text-center py-2 text-slate-400 text-xs">Escribe para buscar productos...</div>
                    )}
                  </div>
                </div>

                {/* Botón para limpiar búsquedas */}
                {(codeSearchTerm || nameSearchTerm) && (
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={clearSearches}
                      variant="outline"
                      size="sm"
                      className="text-slate-600 bg-transparent hover:bg-slate-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar búsquedas
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Ventas del día */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Ventas Hoy</p>
                    <p className="text-3xl font-bold text-blue-900">{stats?.ventasHoy || 0}</p>
                    <p className="text-sm text-blue-600 mt-1">{formatCurrency(stats?.montoVentasHoy || 0)}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total productos */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Productos</p>
                    <p className="text-3xl font-bold text-green-900">{stats?.totalProductos || 0}</p>
                    <p className="text-sm text-green-600 mt-1">En inventario</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock bajo */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Stock Bajo</p>
                    <p className="text-3xl font-bold text-orange-900">{stats?.productosStockBajo || 0}</p>
                    <p className="text-sm text-orange-600 mt-1">Requieren atención</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clientes activos */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Clientes Activos</p>
                    <p className="text-3xl font-bold text-purple-900">{stats?.clientesActivos || 0}</p>
                    <p className="text-sm text-purple-600 mt-1">En el sistema</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accesos rápidos */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Accesos Rápidos
              </CardTitle>
              <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button
                  onClick={() => navigate("/ventas")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Nueva Venta</span>
                </Button>

                <Button
                  onClick={() => navigate("/stock")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                >
                  <Package className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Gestión Stock</span>
                </Button>

                <Button
                  onClick={() => navigate("/clientes")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Users className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Clientes</span>
                </Button>

                <Button
                  onClick={() => navigate("/compras")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                >
                  <Store className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Compras</span>
                </Button>

                <Button
                  onClick={() => navigate("/cuenta-corriente")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  <span className="text-sm">Cta. Corriente</span>
                </Button>

                <Button
                  onClick={() => navigate("/reportes/ventas")}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-slate-50 hover:border-slate-300"
                >
                  <FileText className="w-6 h-6 text-slate-600" />
                  <span className="text-sm">Reportes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contenido principal en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Productos con stock bajo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Productos con Stock Bajo
                  </CardTitle>
                  <Button onClick={() => navigate("/stock")} variant="outline" size="sm">
                    Ver todos
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>Productos que requieren reposición urgente</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockProducts && lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                              {product.codigo}
                            </span>
                            <Badge variant="outline" className={getStockStatusColor(product)}>
                              Stock: {product.stock}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-slate-900 mt-1">{product.nombre}</h4>
                          <p className="text-sm text-slate-600">
                            Mínimo: {product.stock_minimo} | Marca: {product.marca || "Sin marca"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(product.precio_venta)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="text-slate-600 font-medium">¡Excelente!</p>
                    <p className="text-sm text-slate-500">No hay productos con stock bajo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ventas recientes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Ventas Recientes
                  </CardTitle>
                  <Button onClick={() => navigate("/reportes/ventas")} variant="outline" size="sm">
                    Ver todas
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>Últimas transacciones realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSales && recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {recentSales.slice(0, 5).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-mono text-sm font-medium">{sale.numero_factura}</span>
                            <Badge
                              variant="outline"
                              className={
                                sale.estado === "completada"
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : "border-red-200 text-red-700 bg-red-50"
                              }
                            >
                              {sale.estado === "completada" ? "Completada" : "Anulada"}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900 mt-1">{sale.cliente_nombre || "Consumidor Final"}</p>
                          <p className="text-sm text-slate-600">{formatDate(sale.fecha_venta)}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(sale.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-slate-600 font-medium">No hay ventas recientes</p>
                    <p className="text-sm text-slate-500">Las ventas aparecerán aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modal de búsqueda detallada */}
          <ProductQuickSearchModal
            isOpen={isQuickSearchModalOpen}
            onClose={() => setIsQuickSearchModalOpen(false)}
            searchResults={modalSearchResults}
            searchTerm={modalSearchTerm}
            searchType={modalSearchType}
            onNavigateToStock={() => navigate("/stock")}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
