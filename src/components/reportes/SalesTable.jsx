"use client"

import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Eye, FileText, User, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "../../lib/utils"
import { Loading } from "../ui/loading"

const SalesTable = ({ sales, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading text="Cargando ventas..." />
      </div>
    )
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 mb-2">No se encontraron ventas</p>
        <p className="text-sm text-slate-500">Intenta ajustar los filtros de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-800">
            <th className="text-center py-3 px-4 font-medium text-white">Factura</th>
            <th className="text-center py-3 px-4 font-medium text-white">Fecha</th>
            <th className="text-center py-3 px-4 font-medium text-white">Cliente</th>
            <th className="text-center py-3 px-4 font-medium text-white">Items</th>
            <th className="text-center py-3 px-4 font-medium text-white">Subtotal</th>
            <th className="text-center py-3 px-4 font-medium text-white">Descuento</th>
            <th className="text-center py-3 px-4 font-medium text-white">Total</th>
            <th className="text-center py-3 px-4 font-medium text-white">Pago</th>
            <th className="text-center py-3 px-4 font-medium text-white">Estado</th>
            <th className="text-center py-3 px-4 font-medium text-white">Usuario</th>
            <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-medium text-slate-900">{sale.numero_factura}</span>
                </div>
              </td>

              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-600">{formatDate(sale.fecha_venta)}</span>
                </div>
              </td>

              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-900 truncate max-w-xs">{sale.cliente_nombre}</span>
                </div>
              </td>

              <td className="py-3 px-4 text-center">
                <Badge variant="secondary" className="text-xs">
                  {sale.total_items} items
                </Badge>
              </td>

              <td className="py-3 px-4 text-center">
                <span className="font-medium text-slate-900">{formatCurrency(Number(sale.subtotal) || 0)}</span>
              </td>

              <td className="py-3 px-4 text-center">
                {Number(sale.descuento) > 0 ? (
                  <span className="text-red-600 font-medium">-{formatCurrency(Number(sale.descuento))}</span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>

              <td className="py-3 px-4 text-center">
                <span className="font-bold text-green-600">{formatCurrency(Number(sale.total) || 0)}</span>
              </td>

              <td className="py-3 px-4 text-center">
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${
                    sale.tipo_pago === "efectivo"
                      ? "border-green-300 text-green-700"
                      : sale.tipo_pago === "tarjeta"
                        ? "border-blue-300 text-blue-700"
                        : sale.tipo_pago === "transferencia"
                          ? "border-purple-300 text-purple-700"
                          : "border-orange-300 text-orange-700"
                  }`}
                >
                  {sale.tipo_pago}
                </Badge>
              </td>

              <td className="py-3 px-4 text-center">
                <Badge
                  className={`text-xs ${
                    sale.estado === "completada"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  } border`}
                >
                  {sale.estado === "completada" ? "Completada" : "Anulada"}
                </Badge>
              </td>

              <td className="py-3 px-4 text-center">
                <span className="text-sm text-slate-600">{sale.usuario_nombre}</span>
              </td>

              <td className="py-3 px-4 text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(sale.id)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SalesTable
