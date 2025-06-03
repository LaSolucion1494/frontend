"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { CreditCard, Plus, TrendingUp, DollarSign, AlertTriangle, RefreshCw, Calendar } from "lucide-react"
import CashClosingModal from "@/components/cierreCaja/CashClosingModal"
import CashClosingDetailsModal from "@/components/cierreCaja/CashClosingDetailsModal"
import CashClosingFilters from "@/components/cierreCaja/CashClosingFilters"
import CashClosingTable from "@/components/cierreCaja/CashClosingTable"
import { useCashClosing } from "../hooks/useCashClosing"
import { formatCurrency } from "../lib/utils"

const CierreCaja = () => {
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedClosing, setSelectedClosing] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuario: "",
  })

  const {
    closings,
    dailySummary,
    stats,
    loading,
    error,
    fetchDailySummary,
    createClosing,
    fetchClosings,
    getClosingById,
    fetchStats,
  } = useCashClosing()

  // Cargar datos iniciales
  useEffect(() => {
    fetchDailySummary()
    fetchClosings()
    fetchStats()
  }, [fetchDailySummary, fetchClosings, fetchStats])

  const handleNewClosing = () => {
    setIsClosingModalOpen(true)
  }

  const handleClosingComplete = async () => {
    setIsClosingModalOpen(false)
    await fetchDailySummary()
    await fetchClosings()
    await fetchStats()
  }

  const handleViewDetails = async (closingId) => {
    const result = await getClosingById(closingId)
    if (result.success) {
      setSelectedClosing(result.data)
      setIsDetailsModalOpen(true)
    }
  }

  const handleApplyFilters = () => {
    fetchClosings(filters)
    fetchStats(filters)
  }

  const handleRefresh = () => {
    fetchDailySummary()
    fetchClosings(filters)
    fetchStats(filters)
  }

  const today = new Date().toISOString().split("T")[0]
  const canCreateClosing = dailySummary && !dailySummary.yaExisteCierre && dailySummary.resumenTotal.total_ventas > 0

  return (
    <Layout>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cierre de Caja</h1>
            <p className="text-slate-600 mt-1">Control diario de ingresos y balance de caja</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading} className="flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button
              onClick={handleNewClosing}
              disabled={!canCreateClosing || loading}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cierre
            </Button>
          </div>
        </div>

        {/* Resumen del día actual */}
        {dailySummary && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calendar className="w-5 h-5 mr-2" />
                Resumen del Día - {new Date(dailySummary.fecha).toLocaleDateString("es-AR")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-1">Total Ventas</p>
                  <p className="text-2xl font-bold text-blue-800">{dailySummary.resumenTotal.total_ventas}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-1">Monto Total</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(dailySummary.resumenTotal.monto_total || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-1">Efectivo Esperado</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(
                      dailySummary.ventasPorTipoPago
                        .filter((v) => v.tipo_pago === "efectivo")
                        .reduce((sum, v) => sum + Number.parseFloat(v.total_monto || 0), 0),
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-1">Estado</p>
                  {dailySummary.yaExisteCierre ? (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-700">Cerrado</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-orange-700">Pendiente</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desglose por método de pago */}
              {dailySummary.ventasPorTipoPago.length > 0 && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Desglose por Método de Pago</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dailySummary.ventasPorTipoPago.map((payment) => (
                      <div key={payment.tipo_pago} className="bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-slate-600 capitalize">{payment.tipo_pago}</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(payment.total_monto || 0)}</p>
                        <p className="text-xs text-slate-500">{payment.cantidad_ventas} ventas</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alertas */}
              {dailySummary.resumenTotal.total_ventas === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">No hay ventas registradas para el día de hoy</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Estadísticas generales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Cierres</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total_cierres || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monto Total</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.monto_total || 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Promedio Ventas</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.promedio_ventas || 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Diferencias</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.total_diferencias || 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <CashClosingFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          loading={loading}
        />

        {/* Tabla de cierres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Historial de Cierres ({closings.length})
              </div>
              {error && <span className="text-sm text-red-600">Error: {error}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CashClosingTable closings={closings} loading={loading} onViewDetails={handleViewDetails} />
          </CardContent>
        </Card>

        {/* Modales */}
        <CashClosingModal
          isOpen={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          onComplete={handleClosingComplete}
          dailySummary={dailySummary}
        />

        <CashClosingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          closing={selectedClosing}
        />
      </div>
    </Layout>
  )
}

export default CierreCaja
