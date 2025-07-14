"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect, useMemo, useCallback } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DollarSign,
  RefreshCw,
  History,
  Calculator,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Receipt,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Eye,
  CalendarDays,
  ShoppingCart,
  Tag,
} from "lucide-react"
import { useCashClosing } from "../hooks/useCashClosing"
import toast from "react-hot-toast"
import { NumericFormat } from "react-number-format"

const CierreCaja = () => {
  const {
    loading,
    error,
    pendingClosingData,
    cashClosings,
    selectedClosing,
    filters,
    currentClosingRange,
    setCurrentClosingRange,
    currentClosingType,
    setCurrentClosingType,
    fetchPendingCashClosingData,
    performCashClosing,
    fetchCashClosings,
    getCashClosingDetails,
    updateFilters,
    clearFilters,
    formatCurrency,
    formatDate,
    getPaymentMethodLabel,
    getMovementTypeLabel,
    getClosingTypeLabel,
    setSelectedClosing,
  } = useCashClosing()

  const [saldoInicialInput, setSaldoInicialInput] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("cierre-actual")
  const [ajustes, setAjustes] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Actualizar saldo inicial cuando se cargan los datos pendientes
  useEffect(() => {
    if (pendingClosingData) {
      setSaldoInicialInput(pendingClosingData.saldoInicialCaja || "")
    }
  }, [pendingClosingData])

  // Función estable para obtener datos pendientes
  const fetchPendingData = useCallback(() => {
    fetchPendingCashClosingData(
      currentClosingRange.startDate,
      currentClosingRange.startTime,
      currentClosingRange.endDate,
      currentClosingRange.endTime,
      currentClosingType,
    )
  }, [
    fetchPendingCashClosingData,
    currentClosingRange.startDate,
    currentClosingRange.startTime,
    currentClosingRange.endDate,
    currentClosingRange.endTime,
    currentClosingType,
  ])

  // Función para limpiar todos los datos y resetear el formulario
  const handleClearAllData = useCallback(() => {

    // Resetear saldo inicial
    setSaldoInicialInput("")

    // Limpiar ajustes
    setAjustes([])

    // Limpiar observaciones
    setObservaciones("")

    // Resetear trigger para indicar que no hay datos cargados
    setRefreshTrigger(0)

    // Mostrar mensaje de confirmación
    toast.success("Todos los datos han sido limpiados.")
  }, [])

  // Efecto que solo se dispara cuando se presiona el botón (refreshTrigger cambia)
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPendingData()
    }
  }, [refreshTrigger, fetchPendingData])

  // Funciones para manejar el modal de cierre
  const handleOpenClosingModal = () => {
    setIsClosingModalOpen(true)
  }

  const handleCloseClosingModal = () => {
    setIsClosingModalOpen(false)
    setObservaciones("")
    setAjustes([])
  }

  // Funciones para manejar ajustes manuales
  const handleAddAjuste = (type) => {
    setAjustes([...ajustes, { tipo: type, monto: "", descripcion: "" }])
  }

  const handleRemoveAjuste = (index) => {
    const newAjustes = [...ajustes]
    newAjustes.splice(index, 1)
    setAjustes(newAjustes)
  }

  const handleAjusteChange = (index, field, value) => {
    const newAjustes = [...ajustes]
    newAjustes[index][field] = value
    setAjustes(newAjustes)
  }

  // Función para realizar el cierre de caja
  const handlePerformClosing = async () => {
    const saldoInicial = Number.parseFloat(saldoInicialInput)
    if (isNaN(saldoInicial) || saldoInicial < 0) {
      toast.error("El saldo inicial de caja es inválido.")
      return
    }

    const fechaCierre = currentClosingRange.endDate
    const horaCierre = currentClosingRange.endTime

    // Consolidar todos los movimientos para los detalles del cierre
    const allDetails = []

    // Ventas
    pendingClosingData.detallesPagosVentas.forEach((p) => {
      allDetails.push({
        tipo_movimiento: "venta",
        metodo_pago: p.tipo_pago,
        monto: Number.parseFloat(p.total_monto),
        cantidad_transacciones: Number.parseInt(p.cantidad_transacciones),
      })
    })

    // Pagos de clientes a cuenta corriente
    pendingClosingData.detallesPagosClientes.forEach((p) => {
      allDetails.push({
        tipo_movimiento: "pago_cliente",
        metodo_pago: p.tipo_pago,
        monto: Number.parseFloat(p.total_monto),
        cantidad_transacciones: Number.parseInt(p.cantidad_transacciones),
      })
    })

    // Compras (solo si el tipo de cierre es 'full')
    if (currentClosingType === "full") {
      pendingClosingData.detallesPagosCompras.forEach((p) => {
        allDetails.push({
          tipo_movimiento: "compra",
          metodo_pago: p.tipo_pago,
          monto: Number.parseFloat(p.total_monto),
          cantidad_transacciones: Number.parseInt(p.cantidad_transacciones),
        })
      })
    }

    // Ajustes manuales
    ajustes.forEach((ajuste) => {
      const montoAjuste = Number.parseFloat(ajuste.monto)
      if (!isNaN(montoAjuste) && montoAjuste > 0) {
        allDetails.push({
          tipo_movimiento: ajuste.tipo === "ingreso" ? "ajuste_ingreso" : "ajuste_egreso",
          metodo_pago: "efectivo",
          monto: montoAjuste,
          cantidad_transacciones: 1,
          descripcion: ajuste.descripcion,
        })
      }
    })

    const success = await performCashClosing({
      saldoInicialCaja: saldoInicial,
      fechaCierre,
      horaCierre,
      observaciones,
      detalles: allDetails,
      tipoCierre: currentClosingType,
    })

    if (success) {
      handleCloseClosingModal()
      setRefreshTrigger((prev) => prev + 1) // Forzar recarga de datos pendientes
    }
  }

  // Funciones para manejar detalles de cierre
  const handleViewClosingDetails = async (id) => {
    const result = await getCashClosingDetails(id)
    if (result.success) {
      setIsDetailsModalOpen(true)
      setSelectedClosing(result.data)
    }
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedClosing(null)
  }

  // Cálculos para mostrar en la interfaz
  const calculateTotalsForDisplay = useMemo(() => {
    if (!pendingClosingData)
      return {
        totalIngresosEfectivo: 0,
        totalEgresosEfectivo: 0,
        saldoCalculado: 0,
        diferencia: 0,
      }

    let totalIngresosEfectivo = pendingClosingData.ingresosEfectivo
    let totalEgresosEfectivo = 0

    // Solo incluir egresos de compras si el tipo de cierre es 'full'
    if (currentClosingType === "full") {
      totalEgresosEfectivo = pendingClosingData.egresosEfectivo
    }

    // Agregar ajustes manuales
    ajustes.forEach((ajuste) => {
      const montoAjuste = Number.parseFloat(ajuste.monto)
      if (!isNaN(montoAjuste) && montoAjuste > 0) {
        if (ajuste.tipo === "ingreso") {
          totalIngresosEfectivo += montoAjuste
        } else {
          totalEgresosEfectivo += montoAjuste
        }
      }
    })

    const saldoInicial = Number.parseFloat(saldoInicialInput) || 0
    const saldoCalculado = saldoInicial + totalIngresosEfectivo - totalEgresosEfectivo
    const diferencia = 0 // Siempre 0 si el cálculo es correcto

    return {
      totalIngresosEfectivo,
      totalEgresosEfectivo,
      saldoCalculado,
      diferencia,
    }
  }, [pendingClosingData, saldoInicialInput, ajustes, currentClosingType])

  const { totalIngresosEfectivo, totalEgresosEfectivo, saldoCalculado } = calculateTotalsForDisplay

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Cierre de Caja</h1>
                <p className="text-muted-foreground mt-2">
                  Gestiona y audita los movimientos de efectivo de tu negocio
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="cierre-actual" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md">
              <TabsTrigger value="cierre-actual" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Cierre Actual
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Cierres
              </TabsTrigger>
            </TabsList>

            {/* Tab Cierre Actual */}
            <TabsContent value="cierre-actual" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cierre de Caja del Período
                  </CardTitle>
                  <CardDescription>Calcula el cierre de caja para el período y tipo seleccionado.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                      <p className="text-muted-foreground font-medium">Cargando datos...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-16">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <h3 className="text-lg font-medium text-red-700 mb-2">Error al cargar datos</h3>
                      <p className="text-muted-foreground mb-4">{error}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Tipo de Cierre and Saldo Inicial */}
                        <div className="space-y-6">
                          {/* Tipo de Cierre */}
                          <Card className="border-slate-200 bg-slate-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tipo de Cierre
                              </CardTitle>
                              <CardDescription>
                                Selecciona el tipo de movimientos a incluir en el cierre.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ToggleGroup
                                type="single"
                                value={currentClosingType}
                                onValueChange={(value) => value && setCurrentClosingType(value)}
                                className="grid grid-cols-2 gap-2"
                              >
                                <ToggleGroupItem value="ventas_only" aria-label="Solo Ventas">
                                  Solo Ventas
                                </ToggleGroupItem>
                                <ToggleGroupItem value="full" aria-label="Ventas y Compras">
                                  Ventas y Compras
                                </ToggleGroupItem>
                              </ToggleGroup>
                            </CardContent>
                          </Card>

                          <div className="space-y-2">
                            <Label htmlFor="saldoInicial">Saldo Inicial de Caja (Efectivo)</Label>
                            <NumericFormat
                              id="saldoInicial"
                              value={saldoInicialInput}
                              onValueChange={(values) => {
                                const { floatValue } = values
                                setSaldoInicialInput(floatValue || 0)
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="$ "
                              decimalScale={2}
                              fixedDecimalScale={false}
                              allowNegative={false}
                              placeholder="$ 0.00"
                              className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-slate-50 border-slate-800"
                            />
                          </div>
                        </div>

                        {/* Right Column: Selección de Rango de Fecha y Hora */}
                        <Card className="border-slate-200 bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" /> Período de Cierre
                            </CardTitle>
                            <CardDescription>Define el rango de fecha y hora para el cierre de caja.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="startDate">Fecha Inicio</Label>
                                <Input
                                  id="startDate"
                                  type="date"
                                  value={currentClosingRange.startDate}
                                  onChange={(e) =>
                                    setCurrentClosingRange((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="border-slate-800"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="startTime">Hora Inicio</Label>
                                <Input
                                  id="startTime"
                                  type="time"
                                  value={currentClosingRange.startTime}
                                  onChange={(e) =>
                                    setCurrentClosingRange((prev) => ({ ...prev, startTime: e.target.value }))
                                  }
                                  className="border-slate-800"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="endDate">Fecha Fin</Label>
                                <Input
                                  id="endDate"
                                  type="date"
                                  value={currentClosingRange.endDate}
                                  onChange={(e) =>
                                    setCurrentClosingRange((prev) => ({ ...prev, endDate: e.target.value }))
                                  }
                                  className="border-slate-800"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="endTime">Hora Fin</Label>
                                <Input
                                  id="endTime"
                                  type="time"
                                  value={currentClosingRange.endTime}
                                  onChange={(e) =>
                                    setCurrentClosingRange((prev) => ({ ...prev, endTime: e.target.value }))
                                  }
                                  className="border-slate-800"
                                />
                              </div>
                            </div>

                            {/* Botones centrados para actualizar y limpiar datos */}
                            <div className="flex justify-center gap-3 pt-4 border-t border-slate-200">
                              <Button
                                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                                disabled={loading}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                {loading ? "Actualizando..." : "Actualizar Datos"}
                              </Button>

                              <Button
                                onClick={handleClearAllData}
                                disabled={loading}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-6 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-transparent"
                              >
                                <XCircle className="w-4 h-4" />
                                Limpiar Todo
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Mostrar datos solo si existen */}
                      {pendingClosingData && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ingresos */}
                            <Card className="border-green-200 bg-green-50">
                              <CardHeader>
                                <CardTitle className="text-green-700 flex items-center gap-2">
                                  <ArrowRight className="w-5 h-5" /> Ingresos (Efectivo)
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-3xl font-bold text-green-900">
                                  {formatCurrency(totalIngresosEfectivo)}
                                </p>
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm text-green-800">
                                    Ventas en efectivo:{" "}
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        pendingClosingData?.detallesPagosVentas.find((p) => p.tipo_pago === "efectivo")
                                          ?.total_monto || 0,
                                      )}
                                    </span>
                                  </p>
                                  <p className="text-sm text-green-800">
                                    Pagos de clientes (efectivo):{" "}
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        pendingClosingData?.detallesPagosClientes.find(
                                          (p) => p.tipo_pago === "efectivo",
                                        )?.total_monto || 0,
                                      )}
                                    </span>
                                  </p>
                                  {ajustes
                                    .filter((a) => a.tipo === "ingreso")
                                    .map((ajuste, index) => (
                                      <p key={`ajuste-ingreso-${index}`} className="text-sm text-green-800">
                                        Ajuste Ingreso:{" "}
                                        <span className="font-semibold">
                                          {formatCurrency(Number.parseFloat(ajuste.monto) || 0)}
                                        </span>{" "}
                                        ({ajuste.descripcion || "Sin descripción"})
                                      </p>
                                    ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Egresos */}
                            <Card className="border-red-200 bg-red-50">
                              <CardHeader>
                                <CardTitle className="text-red-700 flex items-center gap-2">
                                  <ArrowLeft className="w-5 h-5" /> Egresos (Efectivo)
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-3xl font-bold text-red-900">
                                  {formatCurrency(totalEgresosEfectivo)}
                                </p>
                                <div className="mt-4 space-y-2">
                                  {currentClosingType === "full" ? (
                                    <p className="text-sm text-red-800">
                                      Compras en efectivo:{" "}
                                      <span className="font-semibold">
                                        {formatCurrency(
                                          pendingClosingData?.detallesPagosCompras.find(
                                            (p) => p.tipo_pago === "efectivo",
                                          )?.total_monto || 0,
                                        )}
                                      </span>
                                    </p>
                                  ) : (
                                    <p className="text-sm text-red-800 italic">
                                      Compras no incluidas en cierre "Solo Ventas"
                                    </p>
                                  )}
                                  {ajustes
                                    .filter((a) => a.tipo === "egreso")
                                    .map((ajuste, index) => (
                                      <p key={`ajuste-egreso-${index}`} className="text-sm text-red-800">
                                        Ajuste Egreso:{" "}
                                        <span className="font-semibold">
                                          {formatCurrency(Number.parseFloat(ajuste.monto) || 0)}
                                        </span>{" "}
                                        ({ajuste.descripcion || "Sin descripción"})
                                      </p>
                                    ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Resumen Final */}
                          <Card className="border-slate-800 bg-slate-50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calculator className="w-5 h-5" /> Resumen de Caja
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-white shadow-sm">
                                  <span className="text-sm font-medium text-muted-foreground">Saldo Inicial</span>
                                  <span className="text-xl font-bold text-blue-700">
                                    {formatCurrency(Number.parseFloat(saldoInicialInput) || 0)}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-white shadow-sm">
                                  <span className="text-sm font-medium text-muted-foreground">Total Ingresos</span>
                                  <span className="text-xl font-bold text-green-700">
                                    {formatCurrency(totalIngresosEfectivo)}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-white shadow-sm">
                                  <span className="text-sm font-medium text-muted-foreground">Total Egresos</span>
                                  <span className="text-xl font-bold text-red-700">
                                    {formatCurrency(totalEgresosEfectivo)}
                                  </span>
                                </div>
                              </div>
                              <div className="border-t pt-4 flex justify-between items-center text-xl font-bold">
                                <span>Saldo Final Calculado:</span>
                                <span className="text-slate-800 text-3xl">{formatCurrency(saldoCalculado)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex justify-end">
                            <Button onClick={handleOpenClosingModal} disabled={loading}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Realizar Cierre de Caja
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Mensaje cuando no hay datos */}
                      {!pendingClosingData && !loading && (
                        <div className="text-center py-16">
                          <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            No hay datos de cierre cargados
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Presiona "Actualizar Datos" para cargar la información del período seleccionado.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Historial de Cierres */}
            <TabsContent value="historial" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Historial de Cierres de Caja
                  </CardTitle>
                  <CardDescription>Revisa los cierres de caja anteriores.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="filterFechaInicio">Fecha Inicio</Label>
                      <Input
                        id="filterFechaInicio"
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => updateFilters({ fechaInicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterFechaFin">Fecha Fin</Label>
                      <Input
                        id="filterFechaFin"
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => updateFilters({ fechaFin: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterUsuario">Usuario</Label>
                      <Input
                        id="filterUsuario"
                        type="text"
                        value={filters.usuarioId}
                        onChange={(e) => updateFilters({ usuarioId: e.target.value })}
                        placeholder="ID de usuario"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filterTipoCierre">Tipo de Cierre</Label>
                      <ToggleGroup
                        type="single"
                        value={filters.tipoCierre}
                        onValueChange={(value) => updateFilters({ tipoCierre: value })}
                        className="grid grid-cols-3 gap-2 mt-2"
                      >
                        <ToggleGroupItem value="" aria-label="Todos">
                          Todos
                        </ToggleGroupItem>
                        <ToggleGroupItem value="ventas_only" aria-label="Ventas">
                          Ventas
                        </ToggleGroupItem>
                        <ToggleGroupItem value="full" aria-label="Completo">
                          Completo
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mb-4">
                    <Button onClick={clearFilters} variant="outline">
                      <XCircle className="w-4 h-4 mr-2" /> Limpiar Filtros
                    </Button>
                    <Button onClick={() => fetchCashClosings()} disabled={loading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Buscar
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                      <p className="text-muted-foreground font-medium">Cargando historial...</p>
                    </div>
                  ) : cashClosings.length === 0 ? (
                    <div className="text-center py-16">
                      <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay cierres de caja</h3>
                      <p className="text-muted-foreground mb-4">
                        No se encontraron cierres de caja con los filtros aplicados.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-800">
                            <TableHead className="text-slate-100">Fecha y Hora</TableHead>
                            <TableHead className="text-slate-100">Usuario</TableHead>
                            <TableHead className="text-slate-100 text-right">Saldo Inicial</TableHead>
                            <TableHead className="text-slate-100 text-right">Ingresos Efectivo</TableHead>
                            <TableHead className="text-slate-100 text-right">Egresos Efectivo</TableHead>
                            <TableHead className="text-slate-100 text-right">Saldo Final</TableHead>
                            <TableHead className="text-slate-100 text-right">Diferencia</TableHead>
                            <TableHead className="text-slate-100 text-center">Tipo</TableHead>
                            <TableHead className="text-slate-100 text-center">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cashClosings.map((closing) => (
                            <TableRow key={closing.id}>
                              <TableCell>
                                <div className="font-medium">{formatDate(closing.fecha_cierre)}</div>
                                <div className="text-sm text-muted-foreground">{closing.hora_cierre}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {closing.usuario_nombre}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(closing.saldo_inicial_caja)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(closing.total_ingresos_efectivo)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-red-600">
                                {formatCurrency(closing.total_egresos_efectivo)}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(closing.saldo_final_caja)}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                <span className={closing.diferencia === 0 ? "text-green-600" : "text-red-600"}>
                                  {formatCurrency(closing.diferencia)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{getClosingTypeLabel(closing.tipo_cierre)}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewClosingDetails(closing.id)}
                                  className="h-8 w-8 p-0"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal de Cierre de Caja */}
          <Dialog open={isClosingModalOpen} onOpenChange={setIsClosingModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" /> Confirmar Cierre de Caja
                </DialogTitle>
                <DialogDescription>
                  Revisa los detalles antes de confirmar el cierre de caja para el período seleccionado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Cierre</Label>
                    <Input value={formatDate(currentClosingRange.endDate)} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora de Cierre</Label>
                    <Input value={currentClosingRange.endTime} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saldoInicialModal">Saldo Inicial de Caja (Efectivo)</Label>
                  <NumericFormat
                    id="saldoInicialModal"
                    value={saldoInicialInput}
                    onValueChange={(values) => {
                      const { floatValue } = values
                      setSaldoInicialInput(floatValue || 0)
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$ "
                    decimalScale={2}
                    fixedDecimalScale={false}
                    allowNegative={false}
                    placeholder="$ 0.00"
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-slate-50 border-slate-800"
                  />
                </div>

                <h4 className="font-semibold text-lg mt-4">Movimientos del Período</h4>
                <div className="space-y-3">
                  {/* Ventas */}
                  <div className="border p-3 rounded-md bg-green-50 border-green-200">
                    <p className="font-medium text-green-800 flex items-center gap-2">
                      <Receipt className="w-4 h-4" /> Ingresos por Ventas
                    </p>
                    {pendingClosingData?.detallesPagosVentas.length > 0 ? (
                      pendingClosingData.detallesPagosVentas.map((p, i) => (
                        <p key={`venta-${i}`} className="text-sm text-green-700 ml-6">
                          {getPaymentMethodLabel(p.tipo_pago)}: {formatCurrency(p.total_monto)} (
                          {p.cantidad_transacciones} trans.)
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-green-700 ml-6">No hay ventas registradas.</p>
                    )}
                  </div>

                  {/* Pagos de Clientes */}
                  <div className="border p-3 rounded-md bg-blue-50 border-blue-200">
                    <p className="font-medium text-blue-800 flex items-center gap-2">
                      <User className="w-4 h-4" /> Ingresos por Pagos de Clientes
                    </p>
                    {pendingClosingData?.detallesPagosClientes.length > 0 ? (
                      pendingClosingData.detallesPagosClientes.map((p, i) => (
                        <p key={`pago-cliente-${i}`} className="text-sm text-blue-700 ml-6">
                          {getPaymentMethodLabel(p.tipo_pago)}: {formatCurrency(p.total_monto)} (
                          {p.cantidad_transacciones} trans.)
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-blue-700 ml-6">No hay pagos de clientes registrados.</p>
                    )}
                  </div>

                  {/* Compras */}
                  {currentClosingType === "full" && (
                    <div className="border p-3 rounded-md bg-red-50 border-red-200">
                      <p className="font-medium text-red-800 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Egresos por Compras
                      </p>
                      {pendingClosingData?.detallesPagosCompras.length > 0 ? (
                        pendingClosingData.detallesPagosCompras.map((p, i) => (
                          <p key={`compra-${i}`} className="text-sm text-red-700 ml-6">
                            {getPaymentMethodLabel(p.tipo_pago)}: {formatCurrency(p.total_monto)} (
                            {p.cantidad_transacciones} trans.)
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-red-700 ml-6">No hay compras registradas.</p>
                      )}
                    </div>
                  )}

                  {/* Ajustes Manuales */}
                  <div className="border p-3 rounded-md bg-gray-50 border-gray-200">
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Calculator className="w-4 h-4" /> Ajustes Manuales (Efectivo)
                    </p>
                    {ajustes.length > 0 ? (
                      ajustes.map((ajuste, index) => (
                        <div key={index} className="flex items-center gap-2 ml-6 mt-2">
                          <Badge variant={ajuste.tipo === "ingreso" ? "default" : "destructive"}>
                            {ajuste.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                          </Badge>
                          <Input
                            type="number"
                            step="0.01"
                            value={ajuste.monto}
                            onChange={(e) => handleAjusteChange(index, "monto", e.target.value)}
                            placeholder="Monto"
                            className="w-24"
                          />
                          <Input
                            type="text"
                            value={ajuste.descripcion}
                            onChange={(e) => handleAjusteChange(index, "descripcion", e.target.value)}
                            placeholder="Descripción (opcional)"
                            className="flex-1"
                          />
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveAjuste(index)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 ml-6">No hay ajustes manuales.</p>
                    )}
                    <div className="flex gap-2 mt-3 ml-6">
                      <Button variant="outline" size="sm" onClick={() => handleAddAjuste("ingreso")}>
                        <Plus className="w-4 h-4 mr-1" /> Añadir Ingreso
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddAjuste("egreso")}>
                        <Minus className="w-4 h-4 mr-1" /> Añadir Egreso
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Notas adicionales sobre el cierre de caja..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Saldo Inicial:</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(Number.parseFloat(saldoInicialInput) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total Ingresos Efectivo:</span>
                    <span className="font-bold text-green-700">{formatCurrency(totalIngresosEfectivo)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total Egresos Efectivo:</span>
                    <span className="font-bold text-red-700">{formatCurrency(totalEgresosEfectivo)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center text-xl font-bold">
                    <span>Saldo Final Calculado:</span>
                    <span className="text-slate-800">{formatCurrency(saldoCalculado)}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseClosingModal} disabled={loading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handlePerformClosing} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Realizando Cierre...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Cierre
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Detalles de Cierre de Caja */}
          <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Detalles del Cierre de Caja
                </DialogTitle>
                <DialogDescription>
                  Información detallada del cierre de caja del{" "}
                  <span className="font-semibold">{formatDate(selectedClosing?.fecha_cierre)}</span>.
                </DialogDescription>
              </DialogHeader>
              {selectedClosing && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha y Hora</Label>
                      <Input
                        value={`${formatDate(selectedClosing.fecha_cierre)} ${selectedClosing.hora_cierre}`}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Realizado por</Label>
                      <Input value={selectedClosing.usuario_nombre} readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Saldo Inicial</Label>
                      <Input value={formatCurrency(selectedClosing.saldo_inicial_caja)} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Saldo Final</Label>
                      <Input value={formatCurrency(selectedClosing.saldo_final_caja)} readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Ingresos Efectivo</Label>
                      <Input
                        value={formatCurrency(selectedClosing.total_ingresos_efectivo)}
                        readOnly
                        className="text-green-600 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Egresos Efectivo</Label>
                      <Input
                        value={formatCurrency(selectedClosing.total_egresos_efectivo)}
                        readOnly
                        className="text-red-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Diferencia</Label>
                    <Input
                      value={formatCurrency(selectedClosing.diferencia)}
                      readOnly
                      className={
                        selectedClosing.diferencia === 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                      }
                    />
                  </div>

                  <h4 className="font-semibold text-lg mt-4">Detalles de Movimientos</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Método de Pago</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-center">Transacciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClosing.detalles.length > 0 ? (
                          selectedClosing.detalles.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell>{getMovementTypeLabel(d.tipo_movimiento)}</TableCell>
                              <TableCell>{getPaymentMethodLabel(d.metodo_pago)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(d.monto)}</TableCell>
                              <TableCell className="text-center">{d.cantidad_transacciones}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No hay detalles de movimientos.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedClosing.observaciones && (
                    <div className="space-y-2 mt-4">
                      <Label>Observaciones</Label>
                      <Textarea
                        value={selectedClosing.observaciones}
                        readOnly
                        rows={3}
                        className="resize-none bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDetailsModal}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  )
}

export default CierreCaja
