"use client"

import { formatCurrency, formatDate } from "../../lib/utils"

const SalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No hay datos para mostrar</p>
      </div>
    )
  }

  // Obtener el valor máximo para escalar las barras
  const maxValue = Math.max(...data.map((item) => Number(item.total) || 0))

  return (
    <div className="space-y-4">
      <div className="h-64 flex items-end space-x-2 overflow-x-auto">
        {data.slice(0, 15).map((item, index) => {
          const height = maxValue > 0 ? ((Number(item.total) || 0) / maxValue) * 100 : 0

          return (
            <div key={index} className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-full flex flex-col items-center">
                <div className="text-xs text-slate-600 mb-1 font-medium">{formatCurrency(Number(item.total) || 0)}</div>
                <div
                  className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${formatDate(item.fecha)}: ${formatCurrency(Number(item.total) || 0)} (${item.cantidad} ventas)`}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                {new Date(item.fecha).toLocaleDateString("es-AR", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="text-center text-sm text-slate-600">Ventas por día (últimos 15 días)</div>
    </div>
  )
}

export default SalesChart
