"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Filter, Search, Calendar, X } from "lucide-react"

const CashClosingFilters = ({ filters, onFiltersChange, onApplyFilters, loading }) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value })
  }

  const handleReset = () => {
    const resetFilters = {
      fechaInicio: "",
      fechaFin: "",
      usuario: "",
    }
    onFiltersChange(resetFilters)
  }

  // Establecer fechas por defecto
  const setLastWeek = () => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    onFiltersChange({
      ...filters,
      fechaInicio: lastWeek.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
    })
  }

  const setThisMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

    onFiltersChange({
      ...filters,
      fechaInicio: firstDay.toISOString().split("T")[0],
      fechaFin: today.toISOString().split("T")[0],
    })
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
                  onClick={setLastWeek}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Última Semana
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setThisMonth}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Este Mes
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
                    value={filters.fechaInicio}
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
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtro de usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario" className="text-sm font-medium text-white">
              Usuario
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="usuario"
                placeholder="Buscar por nombre de usuario..."
                value={filters.usuario}
                onChange={(e) => handleFilterChange("usuario", e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:border-slate-500"
              />
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
            <Button
              type="button"
              onClick={onApplyFilters}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CashClosingFilters
