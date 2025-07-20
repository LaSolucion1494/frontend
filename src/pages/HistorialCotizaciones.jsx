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
  Download,
  Eye,
  FileText,
  User,
  X,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
  AlertCircle,
  CheckCircle2,
  History,
  Clock,
  XCircle,
  Edit,
  Ban,
} from "lucide-react"
import CotizacionDetailsModal from "../components/cotizaciones/CotizacionDetailsModal"
import UpdateCotizacionStatusModal from "../components/cotizaciones/UpdateCotizacionStatusModal"
import CancelCotizacionModal from "../components/cotizaciones/CancelCotizacionModal"
import { useCotizaciones } from "../hooks/useCotizaciones"
import { formatCurrency } from "../lib/utils"
import { extractExactDateTime } from "../lib/date-utils"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { useNavigate } from "react-router-dom"
import Pagination from "../components/ui/Pagination"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import toast from "react-hot-toast"

const HistorialCotizaciones = () => {
  const navigate = useNavigate()

  const [selectedCotizacion, setSelectedCotizacion] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [showFilterCard, setShowFilterCard] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const {
    cotizaciones,
    loading,
    error,
    pagination,
    fetchCotizaciones,
    getCotizacionById,
    updateCotizacionStatus,
    cancelCotizacion,
    updateFilters,
  
    formatDate,
  } = useCotizaciones()

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

    // Auto-aplicar filtros para búsqueda rápida
    if (field === "cliente" || field === "numeroCotizacion" || field === "estado") {
      const timeoutId = setTimeout(() => {
        fetchCotizaciones(newFilters)
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
    fetchCotizaciones(newFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      fechaInicio: "",
      fechaFin: "",
      cliente: "",
      numeroCotizacion: "",
      estado: "todos",
      offset: 0,
    }
    updateFilters(resetFilters)
    fetchCotizaciones(resetFilters)
  }

  const handleViewCotizacionDetails = async (cotizacionId) => {
    console.log("Viewing cotizacion details for ID:", cotizacionId)
    const result = await getCotizacionById(cotizacionId)
    if (result.success) {
      setSelectedCotizacion(result.data)
      setIsDetailsModalOpen(true)
    }
  }

  const handleUpdateStatus = async (cotizacionId) => {
    const result = await getCotizacionById(cotizacionId)
    if (result.success) {
      setSelectedCotizacion(result.data)
      setIsStatusModalOpen(true)
    }
  }

  const handleCancelCotizacion = async (cotizacionId) => {
    const result = await getCotizacionById(cotizacionId)
    if (result.success) {
      setSelectedCotizacion(result.data)
      setIsCancelModalOpen(true)
    }
  }

  const handlePageChange = (page) => {
    const newOffset = (page - 1) * pagination.itemsPerPage
    updateFilters({ offset: newOffset })
    fetchCotizaciones({ offset: newOffset })
  }

  const handleExport = async () => {
    try {
      // Crear CSV con las cotizaciones actuales
      const headers = ["Número", "Fecha", "Cliente", "Total", "Estado", "Vencimiento", "Validez"]
      const csvContent = [
        headers.join(","),
        ...cotizaciones.map((cotizacion) => {
          return [
            cotizacion.numero_cotizacion,
            cotizacion.fecha_cotizacion,
            `"${cotizacion.cliente_nombre || "Cliente no especificado"}"`,
            cotizacion.total,
            cotizacion.estado,
            cotizacion.fecha_vencimiento || "Sin vencimiento",
            `${cotizacion.validez_dias} días`,
          ].join(",")
        }),
      ].join("\n")

      // Descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `cotizaciones_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Reporte exportado exitosamente")
    } catch (error) {
      console.error("Error al exportar:", error)
      toast.error("Error al exportar reporte")
    }
  }

  const handleRefresh = () => {
    fetchCotizaciones({ offset: 0 })
  }

  // Función para determinar el estado de la cotización
  const getEstadoDisplay = (cotizacion) => {
    const estadoConfigs = {
      activa: {
        label: "Activa",
        icon: CheckCircle2,
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      aceptada: {
        label: "Aceptada",
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
      },
      rechazada: {
        label: "Rechazada",
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
      },
      vencida: {
        label: "Vencida",
        icon: Clock,
        color: "bg-orange-100 text-orange-800 border-orange-200",
      },
      anulada: {
        label: "Anulada",
        icon: Ban,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      },
    }

    return (
      estadoConfigs[cotizacion.estado] || {
        label: cotizacion.estado,
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    )
  }

  // Función para verificar si se puede cambiar el estado
  const canUpdateStatus = (cotizacion) => {
    return cotizacion.estado !== "anulada"
  }

  // Función para verificar si se puede cancelar
  const canCancel = (cotizacion) => {
    return cotizacion.estado !== "anulada"
  }

  if (loading && cotizaciones.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando historial de cotizaciones..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header y Botones de Acción */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Historial de Cotizaciones</h1>
              <p className="text-muted-foreground mt-2">Gestiona y consulta todas las cotizaciones realizadas</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/cotizaciones")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
              <Button onClick={() => setShowFilterCard(!showFilterCard)} variant="outline" disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                {showFilterCard ? "Ocultar Filtros" : "Mostrar Filtros"}
                {showFilterCard ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              <Button onClick={handleExport} variant="outline" disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleRefresh} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
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
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-muted"
                  >
                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                <CardDescription>Filtra las cotizaciones por período, cliente, estado y más criterios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Búsqueda rápida */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Buscar cliente</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="cliente"
                          placeholder="Nombre del cliente..."
                          value={pagination.cliente || ""}
                          onChange={(e) => handleFilterChange("cliente", e.target.value)}
                          className="pl-10 border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroCotizacion">Número de cotización</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="numeroCotizacion"
                          placeholder="Número de cotización..."
                          value={pagination.numeroCotizacion || ""}
                          onChange={(e) => handleFilterChange("numeroCotizacion", e.target.value)}
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
                  {showAdvancedFilters && (
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
                            <option value="activa">Activas</option>
                            <option value="aceptada">Aceptadas</option>
                            <option value="rechazada">Rechazadas</option>
                            <option value="vencida">Vencidas</option>
                            <option value="anulada">Anuladas</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {pagination.totalItems} cotización{pagination.totalItems !== 1 ? "es" : ""} encontrada
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

          {/* Historial de Cotizaciones */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historial de Cotizaciones
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
              <LoadingOverlay loading={loading && cotizaciones.length > 0} text="Actualizando...">
                {cotizaciones.length === 0 && !loading ? (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron cotizaciones</h3>
                    <p className="text-muted-foreground mb-4">
                      No hay cotizaciones que coincidan con los filtros aplicados
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
                          <th className="text-slate-100 text-left py-3 px-4 font-medium">Cotización</th>
                          <th className="text-slate-100 text-left py-3 px-4 font-medium">Fecha</th>
                          <th className="text-slate-100 text-left py-3 px-4 font-medium">Cliente</th>
                          <th className="text-slate-100 text-left py-3 px-4 font-medium">Total</th>
                          <th className="text-slate-100 text-center py-3 px-4 font-medium">Estado</th>
                          <th className="text-slate-100 text-center py-3 px-4 font-medium">Vencimiento</th>
                          <th className="text-slate-100 text-center py-3 px-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cotizaciones.map((cotizacion) => {
                          const estadoDisplay = getEstadoDisplay(cotizacion)
                          const IconComponent = estadoDisplay.icon
                          const dateTime = extractExactDateTime(cotizacion.fecha_creacion)
                          const isVencida = cotizacion.is_vencida
                          const diasRestantes = cotizacion.dias_restantes

                          return (
                            <tr key={cotizacion.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-mono font-medium text-sm">{cotizacion.numero_cotizacion}</span>
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
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm truncate max-w-xs">
                                    {cotizacion.cliente_nombre || "Cliente no especificado"}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div>
                                  <span className="font-bold text-purple-600">
                                    {formatCurrency(Number(cotizacion.total) || 0)}
                                  </span>
                                  {Number(cotizacion.descuento) > 0 && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Desc: -{formatCurrency(Number(cotizacion.descuento))}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className={estadoDisplay.color}>
                                  <div className="flex items-center gap-1">
                                    <IconComponent className="w-3 h-3" />
                                    <span className="text-xs">{estadoDisplay.label}</span>
                                  </div>
                                </Badge>
                              </td>

                              <td className="py-3 px-4 text-center">
                                {cotizacion.fecha_vencimiento ? (
                                  <div className="text-sm">
                                    <span className={isVencida ? "text-red-600 font-medium" : "text-gray-700"}>
                                      {formatDate(cotizacion.fecha_vencimiento)}
                                    </span>
                                    {diasRestantes !== null && (
                                      <p
                                        className={`text-xs mt-1 ${
                                          diasRestantes < 0
                                            ? "text-red-600"
                                            : diasRestantes <= 3
                                              ? "text-orange-600"
                                              : "text-gray-500"
                                        }`}
                                      >
                                        {diasRestantes < 0
                                          ? `Vencida hace ${Math.abs(diasRestantes)} días`
                                          : diasRestantes === 0
                                            ? "Vence hoy"
                                            : `${diasRestantes} días restantes`}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Sin vencimiento</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewCotizacionDetails(cotizacion.id)}
                                    className="h-8 w-8 p-0"
                                    title="Ver detalles"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  {canUpdateStatus(cotizacion) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(cotizacion.id)}
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                      title="Cambiar estado"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}

                                  {canCancel(cotizacion) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancelCotizacion(cotizacion.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      title="Anular cotización"
                                    >
                                      <Ban className="w-4 h-4" />
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

          {/* Modales */}
          <CotizacionDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            cotizacion={selectedCotizacion}
          />

          <UpdateCotizacionStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            cotizacion={selectedCotizacion}
            onUpdateStatus={updateCotizacionStatus}
          />

          <CancelCotizacionModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            cotizacion={selectedCotizacion}
            onCancel={cancelCotizacion}
          />
        </div>
      </div>
    </Layout>
  )
}

export default HistorialCotizaciones
