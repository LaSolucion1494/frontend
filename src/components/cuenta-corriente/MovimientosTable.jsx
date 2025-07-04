"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { LoadingOverlay } from "../ui/loading"
import { useCuentaCorriente } from "../../hooks/useCuentaCorriente"

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

const MovimientosTable = ({ clienteId, clienteNombre, onBack }) => {
  const [filters, setFilters] = useState({
    tipo: "todos",
    concepto: "todos",
    fechaInicio: "",
    fechaFin: "",
  })

  const { loading, getMovimientosByClient, formatCurrency, formatDateTime } = useCuentaCorriente()

  const [movimientosData, setMovimientosData] = useState(null)

  useEffect(() => {
    if (clienteId) {
      loadMovimientos()
    }
  }, [clienteId, filters])

  const loadMovimientos = async () => {
    if (!clienteId) return

    const result = await getMovimientosByClient(clienteId, filters)
    if (result.success) {
      setMovimientosData(result.data)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      tipo: "todos",
      concepto: "todos",
      fechaInicio: "",
      fechaFin: "",
    })
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
      <Card className="bg-slate-200">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">Selecciona un cliente para ver sus movimientos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Movimientos de Cuenta Corriente</h2>
            {clienteNombre && (
              <p className="text-slate-600 mt-1">
                Cliente: <span className="font-medium">{clienteNombre}</span>
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={loadMovimientos} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Información del cliente */}
      {movimientosData?.cliente && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">{movimientosData.cliente.nombre}</h3>
                  <p className="text-sm text-blue-700">
                    Saldo actual: {formatCurrency(movimientosData.cliente.saldo_cuenta_corriente)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Total de movimientos</p>
                <p className="font-semibold text-blue-900">{movimientosData.movimientos?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="bg-slate-800 border border-slate-200 shadow-lg">
        <CardHeader className="bg-slate-800 border-b border-slate-700">
          <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 -mt-6 -mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium text-white">
                Tipo
              </Label>
              <Select value={filters.tipo} onValueChange={(value) => handleFilterChange("tipo", value)}>
                <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                  <SelectValue placeholder="Tipo de movimiento" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concepto" className="text-sm font-medium text-white">
                Concepto
              </Label>
              <Select value={filters.concepto} onValueChange={(value) => handleFilterChange("concepto", value)}>
                <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                  <SelectValue placeholder="Concepto" />
                </SelectTrigger>
                <SelectContent>
                  {CONCEPTO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">Acciones</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-11 w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <LoadingOverlay loading={loading} text="Cargando movimientos...">
        <Card className="bg-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Movimientos ({movimientosData?.movimientos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-center py-3 px-4 font-medium text-white">Fecha</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Tipo</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Concepto</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Monto</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Saldo Anterior</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Saldo Nuevo</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Referencia</th>
                    <th className="text-center py-3 px-4 font-medium text-white">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosData?.movimientos?.map((movimiento) => (
                    <tr key={movimiento.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">
                          {new Date(movimiento.fecha_movimiento).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(movimiento.fecha_movimiento).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`flex items-center justify-center space-x-1 ${getTipoColor(movimiento.tipo)}`}>
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
                        <span className="font-mono text-sm font-medium">{formatCurrency(movimiento.saldo_nuevo)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">
                          {movimiento.numero_referencia && (
                            <Badge variant="outline" className="text-xs">
                              {movimiento.numero_referencia}
                            </Badge>
                          )}
                          {movimiento.descripcion && (
                            <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                              {movimiento.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-slate-600">{movimiento.usuario_nombre}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!movimientosData?.movimientos || movimientosData.movimientos.length === 0) && !loading && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-2">No se encontraron movimientos</p>
                  <p className="text-sm text-slate-500">
                    {Object.values(filters).some((f) => f && f !== "todos")
                      ? "Intenta ajustar los filtros"
                      : "Este cliente no tiene movimientos registrados"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </LoadingOverlay>
    </div>
  )
}

export default MovimientosTable
