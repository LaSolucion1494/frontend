"use client"

import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Eye, CreditCard, User, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatDate } from "../../lib/utils"
import { Loading } from "../ui/loading"

const CashClosingTable = ({ closings, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading text="Cargando cierres de caja..." />
      </div>
    )
  }

  if (!closings || closings.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 mb-2">No se encontraron cierres de caja</p>
        <p className="text-sm text-slate-500">Los cierres aparecerán aquí una vez que se realicen</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800">
            <th className="text-center py-3 px-4 font-medium text-white">Fecha</th>
            <th className="text-center py-3 px-4 font-medium text-white">Ventas</th>
            <th className="text-center py-3 px-4 font-medium text-white">Monto Total</th>
            <th className="text-center py-3 px-4 font-medium text-white">Efectivo Esperado</th>
            <th className="text-center py-3 px-4 font-medium text-white">Efectivo en Caja</th>
            <th className="text-center py-3 px-4 font-medium text-white">Diferencia</th>
            <th className="text-center py-3 px-4 font-medium text-white">Usuario</th>
            <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {closings.map((closing) => {
            const diferencia = Number.parseFloat(closing.diferencia) || 0
            const isDiferenciaPositiva = diferencia > 0
            const isDiferenciaNegativa = diferencia < 0
            const isDiferenciaCero = diferencia === 0

            return (
              <tr key={closing.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-sm text-slate-900 font-medium">{formatDate(closing.fecha_cierre)}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <Badge variant="secondary" className="text-xs">
                    {closing.total_ventas} ventas
                  </Badge>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(Number.parseFloat(closing.monto_total_ventas) || 0)}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="font-medium text-blue-600">
                    {formatCurrency(Number.parseFloat(closing.efectivo_esperado) || 0)}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number.parseFloat(closing.efectivo_en_caja) || 0)}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {isDiferenciaCero ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-xs">✓ Cuadra</Badge>
                    ) : (
                      <>
                        {isDiferenciaPositiva ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span
                          className={`font-medium text-xs ${isDiferenciaPositiva ? "text-green-600" : "text-red-600"}`}
                        >
                          {isDiferenciaPositiva ? "+" : ""}
                          {formatCurrency(diferencia)}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="text-sm text-slate-600">{closing.usuario_nombre}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(closing.id)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default CashClosingTable
