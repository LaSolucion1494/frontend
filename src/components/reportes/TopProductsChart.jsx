"use client"

import { formatCurrency } from "../../lib/utils"
import { Package } from "lucide-react"

const TopProductsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>No hay datos de productos para mostrar</p>
        </div>
      </div>
    )
  }

  const maxQuantity = Math.max(...data.map((item) => Number(item.cantidad_total) || 0))

  return (
    <div className="space-y-4">
      {data.slice(0, 10).map((product, index) => {
        const percentage = maxQuantity > 0 ? ((Number(product.cantidad_total) || 0) / maxQuantity) * 100 : 0

        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">{product.nombre}</h4>
                <p className="text-sm text-slate-500 font-mono">{product.codigo}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-slate-900">{product.cantidad_total} unidades</p>
                <p className="text-sm text-green-600">{formatCurrency(Number(product.monto_total) || 0)}</p>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TopProductsChart
