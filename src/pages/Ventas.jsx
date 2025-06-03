"use client"

import { useState } from "react"
import Layout from "../components/Layout"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ShoppingCart, Plus, Receipt, TrendingUp, DollarSign, Package } from "lucide-react"
import SaleModal from "../components/sales/SaleModal"
import { useSales } from "../hooks/useSales"
import { formatCurrency } from "../lib/utils"

const Ventas = () => {
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const { getLocalStats } = useSales()

  const stats = getLocalStats()

  const handleNewSale = () => {
    setIsSaleModalOpen(true)
  }

  const handleSaleComplete = () => {
    setIsSaleModalOpen(false)
    // Aquí podrías mostrar un mensaje de éxito o redirigir
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Punto de Venta</h1>
            <p className="text-slate-600 mt-1">Gestiona las ventas de tu negocio</p>
          </div>
          <Button
            onClick={handleNewSale}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Ventas</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completadas</p>
                  <p className="text-2xl font-bold">{stats.completadas}</p>
                </div>
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Monto Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.montoTotal)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Anuladas</p>
                  <p className="text-2xl font-bold">{stats.anuladas}</p>
                </div>
                <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-dashed border-slate-300">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Listo para realizar una venta?</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Haz clic en el botón de abajo para abrir el punto de venta y comenzar a procesar una nueva transacción.
            </p>
            <Button
              onClick={handleNewSale}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Iniciar Nueva Venta
            </Button>
          </CardContent>
        </Card>

        {/* Sale Modal */}
        <SaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onComplete={handleSaleComplete} />
      </div>
    </Layout>
  )
}

export default Ventas
