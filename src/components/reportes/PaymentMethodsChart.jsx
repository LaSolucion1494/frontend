"use client"

import { formatCurrency } from "../../lib/utils"

const PAYMENT_COLORS = {
  efectivo: "bg-green-500",
  tarjeta: "bg-blue-500",
  transferencia: "bg-purple-500",
  otro: "bg-orange-500",
}

const PAYMENT_LABELS = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
}

const PaymentMethodsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No hay datos para mostrar</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + (Number(item.total) || 0), 0)

  return (
    <div className="space-y-4">
      {/* Gráfico de barras horizontales */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((Number(item.total) || 0) / total) * 100 : 0
          const colorClass = PAYMENT_COLORS[item.tipo_pago] || "bg-gray-500"

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">{PAYMENT_LABELS[item.tipo_pago] || item.tipo_pago}</span>
                <span className="text-slate-600">
                  {formatCurrency(Number(item.total) || 0)} ({item.cantidad})
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${colorClass} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 text-right">{percentage.toFixed(1)}%</div>
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsChart
