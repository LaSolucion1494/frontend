"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import useStockMovements from "../hooks/useStockMovements"
import { LoadingOverlay } from "../components/ui/loading"
import Pagination from "../components/ui/Pagination"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  History,
  Search,
  RefreshCw,
  Plus,
  Minus,
  RefreshCwIcon as RefreshIcon,
  FilterX,
  ArrowLeft,
  Settings,
} from "lucide-react"

const MOVEMENT_TYPES = [
  { value: "todos", label: "Todos los tipos" }, // CAMBIO: De "" a "todos"
  { value: "entrada", label: "Entrada" },
  { value: "salida", label: "Salida" },
  { value: "ajuste", label: "Ajuste" },
]

const StockMovementsHistory = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  // Inicializar con límite más pequeño para ver paginación
  const {
    movements,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    handlePageChange,
    fetchMovements,
    clearFilters,
  } = useStockMovements({
    limit: 15, // Límite inicial más pequeño
    offset: 0,
    tipo: "todos", // CAMBIO: Inicializar tipo a "todos"
  })

  // Debounce para búsqueda
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateFilters({ search: searchTerm, offset: 0 })
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, updateFilters])

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

  const handleRefresh = () => {
    fetchMovements({ offset: 0 })
  }

  const MovementTypeBadge = ({ type }) => {
    switch (type) {
      case "entrada":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            <Plus className="w-3 h-3 mr-1" />
            Entrada
          </Badge>
        )
      case "salida":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
            <Minus className="w-3 h-3 mr-1" />
            Salida
          </Badge>
        )
      case "ajuste":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
            <RefreshIcon className="w-3 h-3 mr-1" />
            Ajuste
          </Badge>
        )
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const hasActiveFilters = useMemo(() => {
    // CAMBIO: Ahora 'todos' es un valor válido, no una cadena vacía
    return filters.search || (filters.tipo && filters.tipo !== "todos") || filters.fechaInicio || filters.fechaFin
  }, [filters])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Historial de Movimientos de Stock</h1>
                <p className="text-muted-foreground mt-2">
                  Consulta y filtra todos los movimientos de inventario registrados.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda y Filtros
              </CardTitle>
              <CardDescription>Filtra los movimientos por producto, tipo y período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Primera fila de filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar producto</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Código o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de movimiento</Label>
                    <Select value={filters.tipo} onValueChange={(value) => handleFilterChange("tipo", value)}>
                      <SelectTrigger className="border-slate-800">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOVEMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <option value={10}>10 por página</option>
                      <option value={15}>15 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha Desde</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={filters.fechaInicio}
                      onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                      className="border-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha Hasta</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={filters.fechaFin}
                      onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                      className="border-slate-800"
                    />
                  </div>
                </div>

                {/* Períodos rápidos */}
                <div className="flex flex-wrap gap-2">
                  <Label className="text-sm font-medium">Períodos rápidos:</Label>
                  <Button
                    onClick={() => handleQuickDateFilter(7)}
                    variant="outline"
                    size="sm"
                    className="h-8 border-slate-800 text-xs"
                  >
                    7 días
                  </Button>
                  <Button
                    onClick={() => handleQuickDateFilter(30)}
                    variant="outline"
                    size="sm"
                    className="h-8 border-slate-800 text-xs"
                  >
                    30 días
                  </Button>
                  <Button
                    onClick={() => handleQuickDateFilter(90)}
                    variant="outline"
                    size="sm"
                    className="h-8 border-slate-800 text-xs"
                  >
                    90 días
                  </Button>
                </div>

                {/* Botón limpiar filtros y estadísticas */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {pagination.totalItems} movimiento{pagination.totalItems !== 1 ? "s" : ""} encontrado
                    {pagination.totalItems !== 1 ? "s" : ""}
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      <FilterX className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de movimientos */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Movimientos Registrados
                  </CardTitle>
                  <CardDescription>
                    {pagination.totalItems} movimiento{pagination.totalItems !== 1 ? "s" : ""} encontrado
                    {pagination.totalItems !== 1 ? "s" : ""} - Página {pagination.currentPage} de{" "}
                    {pagination.totalPages}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading && movements.length > 0} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Fecha</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Producto</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Tipo</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Cantidad</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Stock Anterior</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium">Stock Nuevo</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Motivo</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((mov) => (
                        <tr key={mov.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            {format(new Date(mov.fecha_movimiento), "dd/MM/yyyy HH:mm", { locale: es })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{mov.producto_nombre}</div>
                            <div className="text-xs text-muted-foreground font-mono">{mov.producto_codigo}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <MovementTypeBadge type={mov.tipo} />
                          </td>
                          <td
                            className={`py-3 px-4 text-center font-bold ${
                              mov.tipo === "entrada"
                                ? "text-green-600"
                                : mov.tipo === "salida"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {mov.tipo === "entrada" ? "+" : mov.tipo === "salida" ? "-" : ""}
                            {mov.cantidad}
                          </td>
                          <td className="py-3 px-4 text-center">{mov.stock_anterior}</td>
                          <td className="py-3 px-4 text-center font-medium">{mov.stock_nuevo}</td>
                          <td className="py-3 px-4">{mov.motivo}</td>
                          <td className="py-3 px-4 text-muted-foreground">{mov.usuario_nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {movements.length === 0 && !loading && (
                    <div className="text-center py-16">
                      <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron movimientos</h3>
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? "Intenta ajustar los filtros de búsqueda."
                          : "No hay movimientos registrados."}
                      </p>
                    </div>
                  )}
                </div>
              </LoadingOverlay>

              {/* Componente de paginación - siempre visible si hay datos */}
              {movements.length > 0 && (
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

export default StockMovementsHistory
