"use client"

import { Card, CardContent } from "../ui/card"
import { TrendingUp, DollarSign, ShoppingCart, XCircle } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

const SalesStats = ({ stats }) => {
  if (!stats) return null

  const statsCards = [
    {
      title: "Total Ventas",
      value: stats.totalVentas || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Monto Total",
      value: formatCurrency(stats.montoTotal || 0),
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Promedio por Venta",
      value: formatCurrency(stats.totalVentas > 0 ? (stats.montoTotal || 0) / stats.totalVentas : 0),
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Ventas Anuladas",
      value: stats.ventasAnuladas || 0,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon

        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SalesStats
