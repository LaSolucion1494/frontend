"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Building,
  DollarSign,
  ShoppingCart,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  AlertCircle,
  CheckCircle2,
  History,
  PieChart,
  Trash2,
  Truck,
} from "lucide-react"
import { usePurchasesReports } from "../hooks/usePurchasesReports"
import { formatCurrency } from "../lib/utils"
import { extractExactDateTime } from "../lib/date-utils"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import PurchaseDetailsModal from "../components/reportes-compras/PurchaseDetailsModal"
import CancelPurchaseModal from "../components/reportes-compras/CancelPurchaseModal"
import ReceiveProductsModal from "../components/reportes-compras/ReceiveProductsModal"
import { usePurchases } from "../hooks/usePurchase"
import Pagination from "../components/ui/Pagination"
import { Loading, LoadingOverlay } from "../components/ui/loading"

const ReporteCompras = () => {
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFilterCard, setShowFilterCard] = useState(false)
  const [activeTab, setActiveTab] = useState("historial")

  const {
    purchases,
    stats,
    loading,
    error,
    pagination,
    fetchPurchases,
    fetchStats,
    getPurchaseById,
    updateFilters,
    handlePageChange,
  } = usePurchasesReports()

  const { receivePurchaseItems, cancelPurchase } = usePurchases()

  // Cargar datos iniciales (últimos 30 días)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const initialFilters = {
      fechaInicio: thirtyDaysAgo.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
      offset: 0,
    }

    updateFilters(initialFilters)
  }, [updateFilters])

  const handleFilterChange = (field, value) => {
    const newFilters = { [field]: value }

    // Reset offset cuando se cambian filtros
    if (field !== "offset") {
      newFilters.offset = 0
    }

    updateFilters(newFilters)

    // Auto-aplicar filtros para búsqueda rápida y avanzados
    if (
      field === "proveedor" ||
      field === "numeroCompra" ||
      field === "estado" ||
      field === "tipoPago" ||
      field === "fechaInicio" ||
      field === "fechaFin"
    ) {
      const timeoutId = setTimeout(() => {
        fetchPurchases(newFilters)
        fetchStats(newFilters)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  const handleQuickDateFilter = (days) => {
    const today = new Date()
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    const newFilters = {
      fechaInicio: startDate.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
      offset: 0,
    }

    updateFilters(newFilters)
    fetchPurchases(newFilters)
    fetchStats(newFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      fechaInicio: "",
      fechaFin: "",
      proveedor: "",
      numeroCompra: "",
      estado: "todos",
      tipoPago: "todos",
      offset: 0,
    }
    updateFilters(resetFilters)
    fetchPurchases(resetFilters)
    fetchStats(resetFilters)
  }

  const handleViewPurchaseDetails = async (purchaseId) => {
    const result = await getPurchaseById(purchaseId)
    if (result.success) {
      setSelectedPurchase(result.data)
      setIsDetailsModalOpen(true)
    }
  }

  const handleCancelPurchase = async (purchaseId) => {
    const result = await getPurchaseById(purchaseId)
    if (result.success) {
      setSelectedPurchase(result.data)
      setIsCancelModalOpen(true)
    }
  }

  const handleReceiveProducts = async (purchaseId) => {
    const result = await getPurchaseById(purchaseId)
    if (result.success) {
      setSelectedPurchase(result.data)
      setIsReceiveModalOpen(true)
    }
  }

  const handleRefresh = () => {
    fetchPurchases({ offset: 0 })
    fetchStats()
  }

  // Función para determinar el método de pago principal
  const getPaymentMethodDisplay = (purchase) => {
    if (!purchase.pagos || purchase.pagos.length === 0) {
      return {
        type: "no_especificado",
        label: "No especificado",
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    }

    // Si hay múltiples métodos de pago
    if (purchase.pagos.length > 1) {
      return {
        type: "varios",
        label: "Varios métodos",
        icon: CreditCard,
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      }
    }

    // Un solo método de pago
    const pago = purchase.pagos[0]
    const paymentConfigs = {
      efectivo: {
        label: "Efectivo",
        icon: Banknote,
        color: "bg-green-100 text-green-800 border-green-200",
      },
      transferencia: {
        label: "Transferencia",
        icon: Smartphone,
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
      tarjeta_credito: {
        label: "Tarjeta Crédito",
        icon: CreditCard,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      tarjeta_debito: {
        label: "Tarjeta Débito",
        icon: CreditCard,
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
      },
      otro: {
        label: "Otro",
        icon: DollarSign,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      },
    }

    return (
      paymentConfigs[pago.tipo_pago] || {
        label: "No especificado",
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    )
  }

  // Calcular estadísticas adicionales
  const calculateAdditionalStats = () => {
    if (!stats) return {}

    const comprasHoy = purchases.filter((purchase) => {
      const today = new Date().toISOString().split("T")[0]
      const purchaseDate = new Date(purchase.fecha_compra).toISOString().split("T")[0]
      return purchaseDate === today
    }).length

    const comprasAyer = purchases.filter((purchase) => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const purchaseDate = new Date(purchase.fecha_compra).toISOString().split("T")[0]
      return purchaseDate === yesterday
    }).length

    const crecimiento = comprasAyer > 0 ? ((comprasHoy - comprasAyer) / comprasAyer) * 100 : 0

    return {
      comprasHoy,
      comprasAyer,
      crecimiento,
      ticketPromedio: stats.totalCompras > 0 ? (stats.montoTotal || 0) / stats.totalCompras : 0,
    }
  }

  const additionalStats = calculateAdditionalStats()

  // Función para verificar si se pueden recibir productos
  const canReceiveProducts = (purchase) => {
    return purchase.estado === "pendiente" || purchase.estado === "parcial"
  }

  // Función para verificar si se puede cancelar la compra
  const canCancelPurchase = (purchase) => {
    return purchase.estado !== "cancelada"
  }

  if (loading && purchases.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando reportes de compras..." size="lg" />
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
                <h1 className="text-3xl font-bold tracking-tight">Reportes de Compras</h1>
                <p className="text-muted-foreground mt-2">
                  Análisis detallado del rendimiento de compras y gestión de proveedores
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowFilterCard(!showFilterCard)} variant="outline" disabled={loading}>
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilterCard ? "Ocultar Filtros" : "Mostrar Filtros"}
                  {showFilterCard ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
                <Button onClick={handleRefresh} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          {showFilterCard && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtros y Búsqueda
                  </CardTitle>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-muted"
                    title={showFilters ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
                  >
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="sr-only">
                      {showFilters ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
                    </span>
                  </Button>
                </div>
                <CardDescription>
                  Filtra las compras por período, proveedor, método de pago y más criterios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Búsqueda rápida */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proveedor">Buscar proveedor</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="proveedor"
                          placeholder="Nombre del proveedor..."
                          value={pagination.proveedor || ""}
                          onChange={(e) => handleFilterChange("proveedor", e.target.value)}
                          className="pl-10 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroCompra">Número de compra</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="numeroCompra"
                          placeholder="Número de compra..."
                          value={pagination.numeroCompra || ""}
                          onChange={(e) => handleFilterChange("numeroCompra", e.target.value)}
                          className="pl-10 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Períodos rápidos</Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleQuickDateFilter(7)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800"
                        >
                          <Clock className="w-4 h-4 mr-1" />7 días
                        </Button>
                        <Button
                          onClick={() => handleQuickDateFilter(30)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800"
                        >
                          30 días
                        </Button>
                        <Button
                          onClick={() => handleQuickDateFilter(90)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800"
                        >
                          90 días
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Filtros avanzados */}
                  {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicio">Fecha inicio</Label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="fechaInicio"
                              type="date"
                              value={pagination.fechaInicio || ""}
                              onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fechaFin">Fecha fin</Label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="fechaFin"
                              type="date"
                              value={pagination.fechaFin || ""}
                              onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estado">Estado</Label>
                          <select
                            id="estado"
                            value={pagination.estado || "todos"}
                            onChange={(e) => handleFilterChange("estado", e.target.value)}
                            className="w-full h-10 px-3 border border-input rounded-md text-sm focus:border-ring focus:ring-ring/20"
                          >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="recibida">Recibidas</option>
                            <option value="parcial">Parciales</option>
                            <option value="cancelada">Canceladas</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipoPago">Método de pago</Label>
                          <select
                            id="tipoPago"
                            value={pagination.tipoPago || "todos"}
                            onChange={(e) => handleFilterChange("tipoPago", e.target.value)}
                            className="w-full h-10 px-3 border border-input rounded-md text-sm focus:border-ring focus:ring-ring/20"
                          >
                            <option value="todos">Todos los métodos</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta_credito">Tarjeta Crédito</option>
                            <option value="tarjeta_debito">Tarjeta Débito</option>
                            <option value="varios">Varios métodos</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {pagination.totalItems} compra{pagination.totalItems !== 1 ? "s" : ""} encontrada
                          {pagination.totalItems !== 1 ? "s" : ""}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleResetFilters} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Limpiar Filtros
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-900">Error</AlertTitle>
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs para separar Historial y Reportes */}
          <Tabs defaultValue="historial" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md">
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Compras
              </TabsTrigger>
              <TabsTrigger value="reportes" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Reportes
              </TabsTrigger>
            </TabsList>

            {/* Tab de Historial de Compras */}
            <TabsContent value="historial" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Historial de Compras
                      </CardTitle>
                      <CardDescription>
                        {pagination.totalItems} registro{pagination.totalItems !== 1 ? "s" : ""} encontrado
                        {pagination.totalItems !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Total: {pagination.totalItems}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="-mt-3">
                  <LoadingOverlay loading={loading && purchases.length > 0} text="Actualizando...">
                    {purchases.length === 0 && !loading ? (
                      <div className="text-center py-16">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron compras</h3>
                        <p className="text-muted-foreground mb-4">
                          No hay compras que coincidan con los filtros aplicados
                        </p>
                        <Button onClick={handleResetFilters} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Limpiar filtros
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800">
                            <tr className="border-b">
                              <th className="text-slate-100 text-left py-3 px-4 font-medium">Compra</th>
                              <th className="text-slate-100 text-left py-3 px-4 font-medium">Fecha</th>
                              <th className="text-slate-100 text-left py-3 px-4 font-medium">Proveedor</th>
                              <th className="text-slate-100 text-left py-3 px-4 font-medium">Total</th>
                              <th className="text-slate-100 text-center py-3 px-4 font-medium">Método de Pago</th>
                              <th className="text-slate-100 text-center py-3 px-4 font-medium">Estado</th>
                              <th className="text-slate-100 text-center py-3 px-4 font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchases.map((purchase) => {
                              const paymentMethod = getPaymentMethodDisplay(purchase)
                              const IconComponent = paymentMethod.icon
                              const dateTime = extractExactDateTime(purchase.fecha_creacion)

                              return (
                                <tr key={purchase.id} className="border-b hover:bg-muted/50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-mono font-medium text-sm">{purchase.numero_compra}</span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div>
                                      <span className="text-sm font-medium">{dateTime.date}</span>
                                      <p className="text-xs text-muted-foreground">{dateTime.time}</p>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <Building className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm truncate max-w-xs">
                                        {purchase.proveedor_nombre || "Proveedor no especificado"}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div>
                                      <span className="font-bold text-blue-600">
                                        {formatCurrency(Number(purchase.total) || 0)}
                                      </span>
                                      {Number(purchase.descuento) > 0 && (
                                        <p className="text-xs text-red-600 mt-1">
                                          Desc: -{formatCurrency(Number(purchase.descuento))}
                                        </p>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <Badge variant="outline" className={paymentMethod.color}>
                                      <div className="flex items-center gap-1">
                                        <IconComponent className="w-3 h-3" />
                                        <span className="text-xs">{paymentMethod.label}</span>
                                      </div>
                                    </Badge>
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <Badge
                                      variant="outline"
                                      className={
                                        purchase.estado === "recibida"
                                          ? "border-green-200 text-green-700 bg-green-50"
                                          : purchase.estado === "pendiente"
                                            ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                            : purchase.estado === "parcial"
                                              ? "border-blue-200 text-blue-700 bg-blue-50"
                                              : purchase.estado === "cancelada"
                                                ? "border-red-200 text-red-700 bg-red-50"
                                                : "border-gray-200 text-gray-700 bg-gray-50"
                                      }
                                    >
                                      {purchase.estado === "recibida"
                                        ? "Recibida"
                                        : purchase.estado === "pendiente"
                                          ? "Pendiente"
                                          : purchase.estado === "parcial"
                                            ? "Parcial"
                                            : purchase.estado === "cancelada"
                                              ? "Cancelada"
                                              : "Sin estado"}
                                    </Badge>
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewPurchaseDetails(purchase.id)}
                                        className="h-8 w-8 p-0"
                                        title="Ver detalles"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>

                                      {canReceiveProducts(purchase) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleReceiveProducts(purchase.id)}
                                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                          title="Recibir productos"
                                        >
                                          <Truck className="w-4 h-4" />
                                        </Button>
                                      )}

                                      {canCancelPurchase(purchase) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCancelPurchase(purchase.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                          title="Cancelar compra"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </LoadingOverlay>
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Reportes */}
            <TabsContent value="reportes" className="mt-0">
              {/* Estadísticas */}
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Compras */}
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Total Compras</p>
                          <p className="text-3xl font-bold text-blue-900">{stats.totalCompras || 0}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-blue-600">{additionalStats.comprasHoy} hoy</span>
                            {additionalStats.crecimiento !== 0 && (
                              <div className="flex items-center ml-2">
                                {additionalStats.crecimiento >= 0 ? (
                                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                                )}
                                <span
                                  className={`text-xs ${
                                    additionalStats.crecimiento >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {Math.abs(additionalStats.crecimiento).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-full">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monto Total */}
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">Monto Total</p>
                          <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.montoTotal || 0)}</p>
                          <p className="text-xs text-purple-600 mt-2">
                            Promedio: {formatCurrency(additionalStats.ticketPromedio)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-full">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compras Recibidas */}
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">Recibidas</p>
                          <p className="text-3xl font-bold text-green-900">{stats.comprasRecibidas || 0}</p>
                          <p className="text-xs text-green-600 mt-2">
                            {stats.totalCompras > 0
                              ? (((stats.comprasRecibidas || 0) / stats.totalCompras) * 100).toFixed(1)
                              : 0}
                            % del total
                          </p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-full">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compras Pendientes */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-700">Pendientes</p>
                          <p className="text-3xl font-bold text-yellow-900">{stats.comprasPendientes || 0}</p>
                          <p className="text-xs text-yellow-600 mt-2">
                            {stats.totalCompras > 0
                              ? (((stats.comprasPendientes || 0) / stats.totalCompras) * 100).toFixed(1)
                              : 0}
                            % del total
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-500 rounded-full">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                  <p className="text-muted-foreground font-medium">Cargando estadísticas...</p>
                  <p className="text-sm text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
                </div>
              )}

              {/* Gráficos y estadísticas adicionales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Métodos de pago */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Métodos de Pago
                    </CardTitle>
                    <CardDescription>Distribución de métodos de pago utilizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && stats.metodos_pago && stats.metodos_pago.length > 0 ? (
                      <div className="space-y-4">
                        {stats.metodos_pago.map((metodo, index) => {
                          const paymentType = formatPaymentType(metodo.tipo_pago)
                          const PaymentIcon = paymentType.icon
                          const percentage = stats.montoTotal
                            ? ((metodo.total_monto / stats.montoTotal) * 100).toFixed(1)
                            : 0

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${paymentType.bgColor}`}>
                                  <PaymentIcon className={`w-4 h-4 ${paymentType.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{paymentType.label}</p>
                                  <p className="text-xs text-muted-foreground">{metodo.cantidad_usos} transacciones</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(metodo.total_monto)}</p>
                                <p className="text-xs text-muted-foreground">{percentage}% del total</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay datos disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top proveedores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Top Proveedores
                    </CardTitle>
                    <CardDescription>Proveedores con mayor volumen de compras</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && stats.top_proveedores && stats.top_proveedores.length > 0 ? (
                      <div className="space-y-4">
                        {stats.top_proveedores.slice(0, 5).map((proveedor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="font-bold text-blue-700">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{proveedor.nombre}</p>
                                <p className="text-xs text-muted-foreground">{proveedor.cantidad_compras} compras</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(proveedor.total_comprado)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay datos disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modales */}
          <PurchaseDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            purchase={selectedPurchase}
          />

          <CancelPurchaseModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            purchase={selectedPurchase}
            onCancel={cancelPurchase}
          />

          <ReceiveProductsModal
            isOpen={isReceiveModalOpen}
            onClose={() => setIsReceiveModalOpen(false)}
            purchase={selectedPurchase}
            onReceive={receivePurchaseItems}
          />
        </div>
      </div>
    </Layout>
  )
}

// Función auxiliar para formatear tipos de pago
const formatPaymentType = (type) => {
  const types = {
    efectivo: {
      label: "Efectivo",
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    transferencia: {
      label: "Transferencia",
      icon: Smartphone,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    tarjeta_credito: {
      label: "Tarjeta Crédito",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    tarjeta_debito: {
      label: "Tarjeta Débito",
      icon: CreditCard,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    otro: {
      label: "Otro",
      icon: DollarSign,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  }
  return (
    types[type] || {
      label: type || "No especificado",
      icon: DollarSign,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    }
  )
}

export default ReporteCompras
