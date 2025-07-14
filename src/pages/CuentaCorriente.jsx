"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import {
  Search,
  Filter,
  RefreshCw,
  User,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Phone,
  Mail,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  AlertCircle,
  X,
  Eye,
  Settings,
} from "lucide-react"
import { useCuentaCorriente } from "../hooks/useCuentaCorriente"
import { useClients } from "../hooks/useClients"
import PagoModal from "../components/cuenta-corriente/PagoModal"
import AjusteModal from "../components/cuenta-corriente/AjusteModal"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { useNavigate } from "react-router-dom"
import Pagination from "../components/ui/Pagination"
import { Loading, LoadingOverlay } from "../components/ui/loading"

const CuentaCorriente = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showFilterCard, setShowFilterCard] = useState(false)

  const navigate = useNavigate()

  // Inicializar con límite más pequeño para ver paginación
  const {
    resumen,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    handlePageChange,
    fetchResumen,
    registrarPago,
    crearAjuste,
    getLocalStats,
    formatCurrency,
    formatDate,
    clearFilters,
  } = useCuentaCorriente({
    limit: 10, // Límite inicial más pequeño
    offset: 0,
  })

  const { clients, loading: loadingClients, fetchClients } = useClients()

  // Debounce para búsqueda
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateFilters({ cliente: searchTerm, offset: 0 })
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, updateFilters])

  useEffect(() => {
    fetchClients()
  }, [])

  const handleFilterChange = (field, value) => {
    updateFilters({ [field]: value, offset: 0 })
  }

  // Función para cambiar elementos por página
  const handleItemsPerPageChange = (newLimit) => {
    updateFilters({ limit: newLimit, offset: 0 })
  }

  const handleQuickDateFilter = (days) => {
    const getLocalDateString = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const today = new Date()
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    updateFilters({
      fechaInicio: getLocalDateString(startDate),
      fechaFin: getLocalDateString(today),
      offset: 0,
    })
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    clearFilters()
  }

  const handleOpenPagoModal = (client) => {
    setSelectedClient(client)
    setIsPagoModalOpen(true)
  }

  const handleOpenAjusteModal = (client) => {
    setSelectedClient(client)
    setIsAjusteModalOpen(true)
  }

  const handleViewMovimientos = (client) => {
    navigate(`/cuenta-corriente/movimientos/${client.cliente_id}`)
  }

  const handleRegistrarPago = async (pagoData) => {
    const result = await registrarPago(pagoData)
    if (result.success) {
      setIsPagoModalOpen(false)
    }
    return result
  }

  const handleCrearAjuste = async (ajusteData) => {
    const result = await crearAjuste(ajusteData)
    if (result.success) {
      setIsAjusteModalOpen(false)
    }
    return result
  }

  const handleRefresh = () => {
    fetchResumen({ offset: 0 })
  }

  const getSaldoClass = (saldo) => {
    if (saldo > 0.01) return "text-red-600 font-bold"
    if (saldo < -0.01) return "text-green-600 font-bold"
    return "text-gray-600 font-bold"
  }

  const getSaldoStatus = (saldo) => {
    if (saldo > 0.01) return { text: "DEBE", color: "bg-red-100 text-red-800" }
    if (saldo < -0.01) return { text: "A FAVOR", color: "bg-green-100 text-green-800" }
    return { text: "SIN SALDO", color: "bg-gray-100 text-gray-800" }
  }

  const stats = getLocalStats()

  if (loading && (!resumen?.cuentas || resumen.cuentas.length === 0)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando cuentas corrientes..." size="lg" />
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
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Cuentas Corrientes</h1>
                <p className="text-muted-foreground mt-2">
                  Administra las cuentas corrientes de tus clientes y controla los saldos pendientes
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button
                  onClick={() => setShowFilterCard(!showFilterCard)}
                  variant="outline"
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilterCard ? "Ocultar Filtros" : "Mostrar Filtros"}
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
                  >
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                <CardDescription>Filtra las cuentas corrientes por cliente, período y estado de saldo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Búsqueda rápida */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Buscar cliente</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="cliente"
                          placeholder="Nombre del cliente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estado de saldo</Label>
                      <select
                        value={filters.conSaldo}
                        onChange={(e) => handleFilterChange("conSaldo", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-800 rounded-md text-sm focus:border-ring focus:ring-ring/20"
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="con_saldo">Con saldo (deuda)</option>
                        <option value="sin_saldo">Sin saldo</option>
                        <option value="a_favor">A favor del cliente</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Elementos por página
                      </Label>
                      <select
                        value={filters.limit}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="w-full h-10 px-3 border border-slate-800 rounded-md text-sm focus:border-ring focus:ring-ring/20"
                      >
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={25}>25 por página</option>
                        <option value={50}>50 por página</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Períodos rápidos</Label>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleQuickDateFilter(7)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800 text-xs"
                        >
                          7d
                        </Button>
                        <Button
                          onClick={() => handleQuickDateFilter(30)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800 text-xs"
                        >
                          30d
                        </Button>
                        <Button
                          onClick={() => handleQuickDateFilter(90)}
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 border-slate-800 text-xs"
                        >
                          90d
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Filtros avanzados */}
                  {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fechaInicio">Fecha inicio</Label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="fechaInicio"
                              type="date"
                              value={filters.fechaInicio}
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
                              value={filters.fechaFin}
                              onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {pagination.totalItems} cuenta{pagination.totalItems !== 1 ? "s" : ""} encontrada
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

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Cuentas */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Cuentas</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalCuentas || 0}</p>
                      <p className="text-xs text-blue-600 mt-2">Con deuda: {stats.cuentasConSaldo || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-500 rounded-full">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Saldo Total */}
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Saldo Total</p>
                      <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.saldoTotal || 0)}</p>
                      <p className="text-xs text-red-600 mt-2">Promedio: {formatCurrency(stats.saldoPromedio || 0)}</p>
                    </div>
                    <div className="p-3 bg-red-500 rounded-full">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pagos del Mes */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Pagos del Mes</p>
                      <p className="text-3xl font-bold text-green-900">{stats.pagosMesActual?.total_pagos || 0}</p>
                      <p className="text-xs text-green-600 mt-2">
                        Total: {formatCurrency(stats.pagosMesActual?.monto_total_pagos || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500 rounded-full">
                      <ArrowDownRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ventas del Mes */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Ventas del Mes</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {stats.ventasMesActual?.total_ventas_cc || 0}
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        Total: {formatCurrency(stats.ventasMesActual?.monto_total_ventas_cc || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500 rounded-full">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabla de cuentas corrientes */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Cuentas Corrientes
                  </CardTitle>
                  <CardDescription>
                    {pagination.totalItems} cuenta{pagination.totalItems !== 1 ? "s" : ""} encontrada
                    {pagination.totalItems !== 1 ? "s" : ""} - Página {pagination.currentPage} de{" "}
                    {pagination.totalPages}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading && resumen?.cuentas?.length > 0} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr className="border-b">
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Cliente</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Contacto</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Límite de Crédito</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Saldo Actual</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Disponible</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Última Actividad</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen?.cuentas?.map((cuenta) => (
                        <tr key={cuenta.cliente_id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{cuenta.cliente_nombre}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {cuenta.cliente_telefono && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{cuenta.cliente_telefono}</span>
                                </div>
                              )}
                              {cuenta.cliente_email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground truncate max-w-xs">
                                    {cuenta.cliente_email}
                                  </span>
                                </div>
                              )}
                              {!cuenta.cliente_telefono && !cuenta.cliente_email && (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-medium">
                              {cuenta.limite_credito ? formatCurrency(cuenta.limite_credito) : "Sin límite"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={getSaldoClass(cuenta.saldo_actual)}>
                                {formatCurrency(Math.abs(cuenta.saldo_actual))}
                              </span>
                              <Badge className={`text-xs ${getSaldoStatus(cuenta.saldo_actual).color}`}>
                                {getSaldoStatus(cuenta.saldo_actual).text}
                              </Badge>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-medium ${
                                cuenta.saldo_disponible === 999999999 || cuenta.saldo_disponible >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {cuenta.saldo_disponible === 999999999
                                ? "Sin límite"
                                : formatCurrency(cuenta.saldo_disponible)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm text-muted-foreground">
                                {cuenta.ultima_actividad ? formatDate(cuenta.ultima_actividad) : "-"}
                              </span>
                              {cuenta.ultimo_tipo && (
                                <Badge
                                  className={`mt-1 text-xs ${
                                    cuenta.ultimo_tipo === "venta"
                                      ? "bg-orange-100 text-orange-800 border-orange-200"
                                      : cuenta.ultimo_tipo === "pago"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-blue-100 text-blue-800 border-blue-200"
                                  }`}
                                >
                                  {cuenta.ultimo_tipo === "venta"
                                    ? "Venta"
                                    : cuenta.ultimo_tipo === "pago"
                                      ? "Pago"
                                      : "Ajuste"}
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenPagoModal(cuenta)}
                                className="h-8 w-8 p-0 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                title="Registrar pago"
                                disabled={cuenta.saldo_actual <= 0}
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAjusteModal(cuenta)}
                                className="h-8 w-8 p-0 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                title="Crear ajuste"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewMovimientos(cuenta)}
                                className="h-8 w-8 p-0"
                                title="Ver movimientos"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!resumen?.cuentas || resumen.cuentas.length === 0) && !loading && (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No se encontraron cuentas corrientes</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || Object.values(filters).some((f) => f && f !== "todos")
                          ? "Intenta con otra búsqueda o filtros."
                          : "No hay cuentas corrientes registradas."}
                      </p>
                    </div>
                  )}
                </div>
              </LoadingOverlay>

              {/* Componente de paginación - siempre visible si hay datos */}
              {resumen?.cuentas && resumen.cuentas.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modales */}
          <PagoModal
            isOpen={isPagoModalOpen}
            onClose={() => setIsPagoModalOpen(false)}
            onSave={handleRegistrarPago}
            cliente={selectedClient}
          />

          <AjusteModal
            isOpen={isAjusteModalOpen}
            onClose={() => setIsAjusteModalOpen(false)}
            onSave={handleCrearAjuste}
            cliente={selectedClient}
          />
        </div>
      </div>
    </Layout>
  )
}

export default CuentaCorriente
