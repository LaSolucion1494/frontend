"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  History,
  ArrowLeft,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  CreditCard,
  FileText,
  FilePlus,
  FileMinus,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { useCuentaCorriente } from "../../hooks/useCuentaCorriente"
import { clientsService } from "../../services/clientsService"
import { extractExactDateTime } from "../../lib/date-utils"
import Pagination from "../ui/Pagination"
import { Loading, LoadingOverlay } from "../ui/loading"

const TIPO_OPTIONS = [
  { value: "todos", label: "Todos los tipos" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
]

const CONCEPTO_OPTIONS = [
  { value: "todos", label: "Todos los conceptos" },
  { value: "venta", label: "Venta" },
  { value: "pago", label: "Pago" },
  { value: "nota_debito", label: "Nota de Débito" },
  { value: "nota_credito", label: "Nota de Crédito" },
]

const MovimientosTable = () => {
  const { clienteId } = useParams()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    tipo: "todos",
    concepto: "todos",
    fechaInicio: "",
    fechaFin: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [movimientosData, setMovimientosData] = useState(null)
  const [currentClient, setCurrentClient] = useState(null)

  // Configuración de paginación con límite más pequeño para movimientos
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10, // Cambiado de 50 a 10 para ver paginación más fácilmente
    hasNextPage: false,
    hasPrevPage: false,
  })

  const { loading, getMovimientosByClient, formatCurrency } = useCuentaCorriente()

  useEffect(() => {
    if (clienteId) {
      loadClientAndMovimientos()
    }
  }, [clienteId, filters, pagination.currentPage])

  const loadClientAndMovimientos = async () => {
    if (!clienteId) return

    try {
      const clientResult = await clientsService.getById(clienteId)
      if (clientResult.success) {
        setCurrentClient(clientResult.data)
      } else {
        console.error("Error al cargar datos del cliente:", clientResult.message)
        setCurrentClient(null)
      }
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error)
      setCurrentClient(null)
    }

    const finalFilters = {
      ...filters,
      limit: pagination.itemsPerPage,
      offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
    }

    console.log("Cargando movimientos con filtros:", finalFilters) // Para debug

    const result = await getMovimientosByClient(clienteId, finalFilters)
    if (result.success) {
      setMovimientosData(result.data)
      if (result.pagination) {
        console.log("Paginación recibida:", result.pagination) // Para debug
        setPagination(result.pagination)
      }
    } else {
      setMovimientosData(null)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    console.log("Cambiando a página:", page) // Para debug
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  // Función para cambiar el tamaño de página
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }))
  }

  const handleQuickDateFilter = (days) => {
    const today = new Date()
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)

    const newFilters = {
      ...filters,
      fechaInicio: startDate.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
    }

    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      tipo: "todos",
      concepto: "todos",
      fechaInicio: "",
      fechaFin: "",
    })
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const getIconForConcepto = (concepto) => {
    switch (concepto) {
      case "venta":
        return <ShoppingCart className="w-4 h-4" />
      case "pago":
        return <CreditCard className="w-4 h-4" />
      case "nota_debito":
        return <FilePlus className="w-4 h-4" />
      case "nota_credito":
        return <FileMinus className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getConceptoLabel = (concepto) => {
    switch (concepto) {
      case "venta":
        return "Venta"
      case "pago":
        return "Pago"
      case "nota_debito":
        return "Nota de Débito"
      case "nota_credito":
        return "Nota de Crédito"
      default:
        return concepto
    }
  }

  const getTipoColor = (tipo) => {
    return tipo === "debito" ? "text-red-600" : "text-green-600"
  }

  const getTipoIcon = (tipo) => {
    return tipo === "debito" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />
  }

  if (!clienteId) {
    return (
      <Layout>
        <Card className="bg-slate-200">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">
                ID de cliente no proporcionado. Vuelve a la página de cuentas corrientes.
              </p>
              <Button onClick={() => navigate("/cuenta-corriente")} className="mt-4">
                Volver a Cuentas Corrientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  if (loading && (!movimientosData?.movimientos || movimientosData.movimientos.length === 0)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando movimientos..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header de Movimientos */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/cuenta-corriente")}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Cuentas
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Historial de Movimientos</h2>
                {currentClient && (
                  <p className="text-slate-600 mt-1">
                    Cliente: <span className="font-medium">{currentClient.nombre}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              <Button variant="outline" onClick={loadClientAndMovimientos} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Información del cliente (compacta) */}
          {currentClient && (
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">{currentClient.nombre}</h3>
                      <p className="text-sm text-blue-700">
                        Saldo actual: {formatCurrency(currentClient.saldo_cuenta_corriente)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Total de movimientos</p>
                    <p className="font-semibold text-blue-900">{pagination.totalItems || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de Filtros Integrada */}
          {showFilters && (
            <Card className="border-slate-200 shadow-sm mb-6">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-slate-600" />
                  Opciones de Filtrado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-sm font-medium text-slate-700">
                      Tipo de movimiento
                    </Label>
                    <select
                      id="tipo"
                      value={filters.tipo}
                      onChange={(e) => handleFilterChange("tipo", e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-slate-800 focus:ring-slate-800/20 bg-slate-50"
                    >
                      {TIPO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto" className="text-sm font-medium text-slate-700">
                      Concepto
                    </Label>
                    <select
                      id="concepto"
                      value={filters.concepto}
                      onChange={(e) => handleFilterChange("concepto", e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-slate-800 focus:ring-slate-800/20 bg-slate-50"
                    >
                      {CONCEPTO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Elementos por página</Label>
                    <select
                      value={pagination.itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-slate-800 focus:ring-slate-800/20 bg-slate-50"
                    >
                      <option value={5}>5 por página</option>
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Períodos rápidos</Label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleQuickDateFilter(7)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                      >
                        <Calendar className="w-4 h-4 mr-1" />7 días
                      </Button>
                      <Button
                        onClick={() => handleQuickDateFilter(30)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                      >
                        30 días
                      </Button>
                      <Button
                        onClick={() => handleQuickDateFilter(90)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                      >
                        90 días
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio" className="text-sm font-medium text-slate-700">
                      Fecha inicio
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                        className="pl-10 h-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin" className="text-sm font-medium text-slate-700">
                      Fecha fin
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="fechaFin"
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                        className="pl-10 h-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center pt-4 border-t">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de movimientos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Detalle de Movimientos ({pagination.totalItems || 0})
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </div>
              </div>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading && movimientosData?.movimientos?.length > 0} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr className="border-b">
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Fecha</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Tipo</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Concepto</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Monto</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Saldo Anterior</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Saldo Nuevo</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Referencia</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosData?.movimientos?.map((movimiento) => {
                        const dateTime = extractExactDateTime(movimiento.fecha_movimiento)
                        return (
                          <tr key={movimiento.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="text-sm">{dateTime.date}</div>
                              <div className="text-xs text-muted-foreground">{dateTime.time}</div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div
                                className={`flex items-center justify-center space-x-1 ${getTipoColor(movimiento.tipo)}`}
                              >
                                {getTipoIcon(movimiento.tipo)}
                                <span className="font-medium capitalize">{movimiento.tipo}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {getIconForConcepto(movimiento.concepto)}
                                <span className="text-sm">{getConceptoLabel(movimiento.concepto)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-medium ${getTipoColor(movimiento.tipo)}`}>
                                {formatCurrency(movimiento.monto)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-mono text-sm">{formatCurrency(movimiento.saldo_anterior)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-mono text-sm font-medium">
                                {formatCurrency(movimiento.saldo_nuevo)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="text-sm">
                                {movimiento.numero_referencia && (
                                  <Badge variant="outline" className="text-xs">
                                    {movimiento.numero_referencia}
                                  </Badge>
                                )}
                                {movimiento.descripcion && (
                                  <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                    {movimiento.descripcion}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-muted-foreground">{movimiento.usuario_nombre}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {(!movimientosData?.movimientos || movimientosData.movimientos.length === 0) && !loading && (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron movimientos</h3>
                      <p className="text-muted-foreground mb-4">
                        {Object.values(filters).some((f) => f && f !== "todos")
                          ? "No hay movimientos que coincidan con los filtros aplicados"
                          : "Este cliente no tiene movimientos registrados"}
                      </p>
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </LoadingOverlay>

              {/* Componente de paginación - siempre visible si hay datos */}
              {movimientosData?.movimientos && movimientosData.movimientos.length > 0 && (
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
        </div>
      </div>
    </Layout>
  )
}

export default MovimientosTable
