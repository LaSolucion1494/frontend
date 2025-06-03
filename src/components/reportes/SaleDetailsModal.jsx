"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { X, FileText, User, CreditCard, ShoppingCart, Package, Phone, Mail, MapPin } from "lucide-react"
import { formatCurrency, formatDateTime } from "../../lib/utils"

const SaleDetailsModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Detalles de Venta</h2>
              <p className="text-sm text-slate-300 mt-1">Factura: {sale.numero_factura}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información de la venta */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Información de la Venta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Número de Factura:</span>
                    <span className="font-mono font-semibold">{sale.numero_factura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecha:</span>
                    <span className="font-medium">{formatDateTime(sale.fecha_venta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Estado:</span>
                    <Badge
                      className={`${
                        sale.estado === "completada"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      } border`}
                    >
                      {sale.estado === "completada" ? "Completada" : "Anulada"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Usuario:</span>
                    <span className="font-medium">{sale.usuario_nombre}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Información del cliente */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-slate-600 text-sm">Nombre:</span>
                    <p className="font-medium text-slate-900">{sale.cliente_nombre}</p>
                  </div>

                  {sale.cliente_telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{sale.cliente_telefono}</span>
                    </div>
                  )}

                  {sale.cliente_email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{sale.cliente_email}</span>
                    </div>
                  )}

                  {sale.cliente_direccion && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-sm text-slate-600">{sale.cliente_direccion}</span>
                    </div>
                  )}

                  {sale.cliente_cuit && (
                    <div>
                      <span className="text-slate-600 text-sm">CUIT:</span>
                      <p className="font-mono text-sm">{sale.cliente_cuit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Productos vendidos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Productos Vendidos ({sale.detalles?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 text-sm font-medium text-slate-600">Producto</th>
                        <th className="text-center py-2 text-sm font-medium text-slate-600">Cantidad</th>
                        <th className="text-right py-2 text-sm font-medium text-slate-600">Precio Unit.</th>
                        <th className="text-right py-2 text-sm font-medium text-slate-600">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.detalles?.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900">{item.producto_nombre}</p>
                                <p className="text-sm text-slate-500 font-mono">{item.producto_codigo}</p>
                                {item.producto_marca && <p className="text-xs text-slate-500">{item.producto_marca}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant="secondary">{item.cantidad}</Badge>
                          </td>
                          <td className="py-3 text-right font-medium">
                            {formatCurrency(Number(item.precio_unitario) || 0)}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(Number(item.subtotal) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Totales y pago */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumen de totales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Resumen de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(Number(sale.subtotal) || 0)}</span>
                  </div>

                  {Number(sale.descuento) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Descuento:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(Number(sale.descuento))}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-3">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(Number(sale.total) || 0)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Método de pago:</span>
                    <Badge variant="outline" className="capitalize">
                      {sale.tipo_pago}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Observaciones */}
              {sale.observaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Observaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{sale.observaciones}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end p-6 border-t border-slate-200 bg-slate-50">
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SaleDetailsModal
