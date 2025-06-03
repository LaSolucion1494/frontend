"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Filter, Search, Calendar, X } from "lucide-react"

const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos los estados" },
  { value: "completada", label: "Completadas" },
  { value: "anulada", label: "Anuladas" },
]

const TIPO_PAGO_OPTIONS = [
  { value: "todos", label: "Todos los métodos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
]

const SalesFilters = ({ filters, onFiltersChange, onApplyFilters, onResetFilters, loading }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleApply = () => {
    onApplyFilters()
  }

  const handleReset = () => {
    const resetFilters = {
      fechaInicio: "",
      fechaFin: "",
      cliente: "",
      estado: "todos",
      tipoPago: "todos",
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onResetFilters()
  }

  // Establecer fechas por defecto (último mes)
  const setLastMonth = () => {
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    const newFilters = {
      ...localFilters,
      fechaInicio: lastMonth.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const setThisMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

    const newFilters = {
      ...localFilters,
      fechaInicio: firstDay.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <Card className="mb-6 bg-slate-800 border border-slate-200 shadow-lg">
      <CardHeader className="bg-slate-800 border-b border-slate-700">
        <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
          <Filter className="w-3 h-3 mr-1" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 -mt-6 -mb-3">
        <div className="space-y-6">
          {/* Filtros de fecha */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Rango de Fechas</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setThisMonth}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Este Mes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setLastMonth}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Último Mes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="text-sm font-medium text-white">
                  Fecha Inicio
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={localFilters.fechaInicio}
                    onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="text-sm font-medium text-white">
                  Fecha Fin
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="fechaFin"
                    type="date"
                    value={localFilters.fechaFin}
                    onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Otros filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente" className="text-sm font-medium text-white">
                Cliente
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="cliente"
                  placeholder="Buscar por nombre..."
                  value={localFilters.cliente}
                  onChange={(e) => handleFilterChange("cliente", e.target.value)}
                  className="pl-10 h-11 border-slate-300 focus:border-slate-500"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-sm font-medium text-white">
                Estado
              </Label>
              <Select value={localFilters.estado} onValueChange={(value) => handleFilterChange("estado", value)}>
                <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                  <SelectValue placeholder="Estado de la venta" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de pago */}
            <div className="space-y-2">
              <Label htmlFor="tipoPago" className="text-sm font-medium text-white">
                Método de Pago
              </Label>
              <Select value={localFilters.tipoPago} onValueChange={(value) => handleFilterChange("tipoPago", value)}>
                <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_PAGO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
            <Button type="button" onClick={handleApply} disabled={loading} className="bg-slate-800 hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesFilters
