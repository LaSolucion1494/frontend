"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  CreditCard,
  Search,
  RefreshCw,
  Filter,
  Plus,
  User,
  DollarSign,
  History,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Phone,
  Mail,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { LoadingOverlay } from "../components/ui/loading"
import { useCuentaCorriente } from "../hooks/useCuentaCorriente"
import { useClients } from "../hooks/useClients"
import PagoModal from "@/components/cuenta-corriente/PagoModal"
import AjusteModal from "@/components/cuenta-corriente/AjusteModal"
import MovimientosTable from "@/components/cuenta-corriente/MovimientosTable"

const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos los saldos" },
  { value: "true", label: "Con saldo pendiente" },
  { value: "false", label: "Sin saldo pendiente" },
]

const CuentaCorriente = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState("todos")
  const [activeTab, setActiveTab] = useState("cuentas")

  // Estados para modales
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedClientMovimientos, setSelectedClientMovimientos] = useState(null)

  // Hooks personalizados
  const { resumen, loading, error, fetchResumen, updateFilters, registrarPago, crearAjuste, getLocalStats } =
    useCuentaCorriente()
  const { clients, loading: loadingClients, fetchClients } = useClients()

  // Cargar datos iniciales
  useEffect(() => {
    fetchResumen()
    fetchClients()
  }, [])

  // Actualizar filtros cuando cambien los estados locales
  useEffect(() => {
    const filters = {
      search: searchTerm.trim(),
    }

    if (selectedEstado === "true") {
      filters.conSaldo = "true"
    } else if (selectedEstado === "false") {
      filters.conSaldo = "false"
    }

    updateFilters(filters)
    fetchResumen(filters)
  }, [searchTerm, selectedEstado])

  const handleRefresh = () => {
    fetchResumen()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedEstado("todos")
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
    setSelectedClientMovimientos(client)
    setActiveTab("movimientos")
  }

  const handleRegistrarPago = async (pagoData) => {
    const result = await registrarPago(pagoData)
    if (result.success) {
      setIsPagoModalOpen(false)
      fetchResumen()
    }
    return result
  }

  const handleCrearAjuste = async (ajusteData) => {
    const result = await crearAjuste(ajusteData)
    if (result.success) {
      setIsAjusteModalOpen(false)
      fetchResumen()
    }
    return result
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSaldoClass = (saldo) => {
    if (saldo <= 0.01) return "text-green-600"
    return "text-red-600"
  }

  const stats = getLocalStats()

  return (
    <Layout>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Cuentas Corrientes</h1>
            <p className="text-slate-600 mt-1">Administra las cuentas corrientes de tus clientes</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsPagoModalOpen(true)}
              className="flex items-center bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Pago
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-slate-100 border">
            <TabsTrigger value="cuentas" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Cuentas Corrientes
            </TabsTrigger>
            <TabsTrigger
              value="movimientos"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              <History className="w-4 h-4 mr-2" />
              Movimientos
            </TabsTrigger>
          </TabsList>

          {/* Contenido de las pestañas */}
          <TabsContent value="cuentas" className="mt-6">
            {/* Resumen de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">Total Cuentas</h3>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stats?.totalCuentas || 0}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    Con saldo: <span className="font-medium">{stats?.cuentasConSaldo || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">Saldo Total</h3>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${getSaldoClass(stats?.saldoTotal)}`}>
                    {formatCurrency(stats?.saldoTotal)}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    Saldo promedio: <span className="font-medium">{formatCurrency(stats?.saldoPromedio)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">Pagos del Mes</h3>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{stats?.pagosMesActual?.total_pagos || 0}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    Total:{" "}
                    <span className="font-medium">{formatCurrency(stats?.pagosMesActual?.monto_total_pagos)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-600">Ventas del Mes</h3>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    {stats?.ventasMesActual?.total_ventas_cc || 0}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    Total:{" "}
                    <span className="font-medium">{formatCurrency(stats?.ventasMesActual?.monto_total_ventas_cc)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card className="mb-6 bg-slate-800 border border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-800 border-b border-slate-700">
                <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtros y Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 -mt-6 -mb-3">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Búsqueda */}
                    <div className="space-y-2">
                      <Label htmlFor="search" className="text-sm font-medium text-white">
                        Buscar clientes
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Nombre, teléfono, email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium text-white">
                        Estado
                      </Label>
                      <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                        <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                          <SelectValue placeholder="Estado de cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADO_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Limpiar filtros */}
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
                </div>
              </CardContent>
            </Card>

            {/* Tabla de cuentas corrientes */}
            <LoadingOverlay loading={loading} text="Cargando cuentas corrientes...">
              <Card className="bg-slate-200">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Cuentas Corrientes ({resumen?.cuentas?.length || 0})
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white">
                      <thead>
                        <tr className="bg-slate-800">
                          <th className="text-center py-3 px-4 font-medium text-white">Cliente</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Contacto</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Límite de Crédito</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Saldo Actual</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Disponible</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Última Actividad</th>
                          <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen?.cuentas?.map((cuenta) => (
                          <tr key={cuenta.cliente_id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-medium text-slate-900">{cuenta.cliente_nombre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="space-y-1">
                                {cuenta.cliente_telefono && (
                                  <div className="flex items-center justify-center space-x-1 text-sm">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-600">{cuenta.cliente_telefono}</span>
                                  </div>
                                )}
                                {cuenta.cliente_email && (
                                  <div className="flex items-center justify-center space-x-1 text-sm">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-600 truncate max-w-xs">{cuenta.cliente_email}</span>
                                  </div>
                                )}
                                {!cuenta.cliente_telefono && !cuenta.cliente_email && (
                                  <span className="text-slate-400 text-sm">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-medium text-slate-900">
                                {cuenta.limite_credito ? formatCurrency(cuenta.limite_credito) : "Sin límite"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-medium ${getSaldoClass(cuenta.saldo_actual)}`}>
                                {formatCurrency(cuenta.saldo_actual)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`font-medium ${
                                    cuenta.saldo_disponible === 999999999 || cuenta.saldo_disponible > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {cuenta.saldo_disponible === 999999999
                                    ? "Sin límite"
                                    : formatCurrency(cuenta.saldo_disponible)}
                                </span>
                                {cuenta.limite_credito && cuenta.saldo_disponible !== 999999999 && (
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        cuenta.saldo_actual <= 0.01
                                          ? "bg-green-500"
                                          : (cuenta.saldo_actual / cuenta.limite_credito) * 100 > 80
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                      }`}
                                      style={{
                                        width: `${
                                          cuenta.saldo_actual <= 0.01
                                            ? "100%"
                                            : Math.min(
                                                100,
                                                Math.max(0, 100 - (cuenta.saldo_actual / cuenta.limite_credito) * 100),
                                              )
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm text-slate-600">
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
                                  className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                  title="Registrar pago"
                                  disabled={cuenta.saldo_actual <= 0.01}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenAjusteModal(cuenta)}
                                  className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  title="Crear ajuste"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewMovimientos(cuenta)}
                                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                  title="Ver movimientos"
                                >
                                  <History className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {(!resumen?.cuentas || resumen.cuentas.length === 0) && !loading && (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 mb-2">No se encontraron cuentas corrientes</p>
                        <p className="text-sm text-slate-500">
                          {searchTerm || selectedEstado !== "todos"
                            ? "Intenta ajustar los filtros"
                            : "No hay clientes con cuenta corriente habilitada"}
                        </p>
                        {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </LoadingOverlay>
          </TabsContent>

          <TabsContent value="movimientos" className="mt-6">
            <MovimientosTable
              clienteId={selectedClientMovimientos?.cliente_id}
              clienteNombre={selectedClientMovimientos?.cliente_nombre}
              onBack={() => setActiveTab("cuentas")}
            />
          </TabsContent>
        </Tabs>

        {/* Modales */}
        <PagoModal
          isOpen={isPagoModalOpen}
          onClose={() => setIsPagoModalOpen(false)}
          onSave={handleRegistrarPago}
          cliente={selectedClient}
          clientes={clients}
        />

        <AjusteModal
          isOpen={isAjusteModalOpen}
          onClose={() => setIsAjusteModalOpen(false)}
          onSave={handleCrearAjuste}
          cliente={selectedClient}
          clientes={clients}
        />
      </div>
    </Layout>
  )
}

export default CuentaCorriente
