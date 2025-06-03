"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Download, RefreshCw, Filter } from "lucide-react"
import SalesFilters from "../components/reportes/SalesFilters"
import SalesStats from "../components/reportes/SalesStats"
import SalesChart from "../components/reportes/SalesChart"
import SalesTable from "../components/reportes/SalesTable"
import TopProductsChart from "../components/reportes/TopProductsChart"
import PaymentMethodsChart from "../components/reportes/PaymentMethodsChart"
import SaleDetailsModal from "../components/reportes/SaleDetailsModal"
import { useSalesReports } from "../hooks/useSalesReports"
import { Loading } from "../components/ui/loading"

const ReporteVentas = () => {
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    cliente: "",
    estado: "todos",
    tipoPago: "todos",
  })

  const [selectedSale, setSelectedSale] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const { sales, stats, loading, error, fetchSales, fetchStats, exportSales, getSaleById } = useSalesReports()

  // Cargar datos iniciales
  useEffect(() => {
    handleApplyFilters()
  }, [])

  const handleApplyFilters = async () => {
    await Promise.all([fetchSales(filters), fetchStats(filters)])
  }

  const handleResetFilters = () => {
    const resetFilters = {
      fechaInicio: "",
      fechaFin: "",
      cliente: "",
      estado: "todos",
      tipoPago: "todos",
    }
    setFilters(resetFilters)
    fetchSales(resetFilters)
    fetchStats(resetFilters)
  }

  const handleExport = async () => {
    await exportSales(filters)
  }

  const handleViewSaleDetails = async (saleId) => {
    const result = await getSaleById(saleId)
    if (result.success) {
      setSelectedSale(result.data)
      setIsDetailsModalOpen(true)
    }
  }

  const handleRefresh = () => {
    handleApplyFilters()
  }

  if (loading && !sales.length && !stats) {
    return (
      <Layout>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando reportes de ventas..." size="lg" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reportes de Ventas</h1>
            <p className="text-slate-600 mt-1">Análisis detallado de las ventas del negocio</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Ocultar" : "Mostrar"} Filtros
            </Button>
            <Button onClick={handleExport} variant="outline" disabled={loading} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center bg-slate-800 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <SalesFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            loading={loading}
          />
        )}

        {/* Estadísticas principales */}
        {stats && <SalesStats stats={stats} />}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de ventas por día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Ventas por Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={stats?.ventasPorDia || []} />
            </CardContent>
          </Card>

          {/* Gráfico de métodos de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodsChart data={stats?.ventasPorTipoPago || []} />
            </CardContent>
          </Card>
        </div>

        {/* Productos más vendidos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={stats?.productosTopVentas || []} />
          </CardContent>
        </Card>

        {/* Tabla de ventas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Detalle de Ventas ({sales.length})
              </div>
              {error && <span className="text-sm text-red-600">Error: {error}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTable sales={sales} loading={loading} onViewDetails={handleViewSaleDetails} />
          </CardContent>
        </Card>

        {/* Modal de detalles de venta */}
        <SaleDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          sale={selectedSale}
        />
      </div>
    </Layout>
  )
}

export default ReporteVentas
