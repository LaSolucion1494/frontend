"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  X,
  FileText,
  User,
  CreditCard,
  ShoppingCart,
  Package,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Building,
  Banknote,
  Smartphone,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { extractExactDateTime } from "../../lib/date-utils"

const SaleDetailsModal = ({ isOpen, onClose, sale }) => {
  if (!sale) return null

  // Función para formatear tipos de pago
  const formatPaymentType = (type) => {
    const types = {
      efectivo: { label: "Efectivo", icon: Banknote, color: "text-green-600" },
      tarjeta: { label: "Tarjeta", icon: CreditCard, color: "text-blue-600" },
      transferencia: { label: "Transferencia", icon: Smartphone, color: "text-purple-600" },
      cuenta_corriente: { label: "Cuenta Corriente", icon: Building, color: "text-orange-600" },
      otro: { label: "Otro", icon: DollarSign, color: "text-gray-600" },
    }
    return types[type] || { label: type, icon: DollarSign, color: "text-gray-600" }
  }

  // Función para obtener el estado de la venta
  const getEstadoVenta = (estado) => {
    switch (estado) {
      case "completada":
        return {
          label: "Completada",
          icon: CheckCircle2,
          color: "bg-green-100 text-green-800 border-green-200",
        }
      case "anulada":
        return {
          label: "Anulada",
          icon: X,
          color: "bg-red-100 text-red-800 border-red-200",
        }
      default:
        return {
          label: estado,
          icon: AlertCircle,
          color: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const estadoVenta = getEstadoVenta(sale.estado)
  const EstadoIcon = estadoVenta.icon
  const dateTime = extractExactDateTime(sale.fecha_creacion)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200">
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Detalles de Venta</span>
              <p className="text-sm text-slate-600 font-normal mt-1">Factura: {sale.numero_factura}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información de la venta */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-slate-600" />
                    Información de la Venta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Número:</span>
                    <span className="font-mono font-semibold text-slate-900">{sale.numero_factura}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-600 text-sm">Fecha:</span>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">{dateTime.date}</div>
                      <div className="text-xs text-slate-500">{dateTime.time}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Estado:</span>
                    <Badge className={`${estadoVenta.color} border font-medium`}>
                      <EstadoIcon className="w-3 h-3 mr-1" />
                      {estadoVenta.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Usuario:</span>
                    <span className="font-medium text-slate-900">{sale.usuario_nombre}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">ID Venta:</span>
                    <span className="font-mono text-sm text-slate-700">#{sale.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Información del cliente */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-600" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <span className="text-slate-600 text-sm">Nombre:</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {sale.cliente_nombre || "Cliente no especificado"}
                    </p>
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
                      <p className="font-mono text-sm text-slate-700 mt-1">{sale.cliente_cuit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen financiero */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-600" />
                    Resumen Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Subtotal:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(Number(sale.subtotal) || 0)}</span>
                  </div>

                  {Number(sale.descuento) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Descuento:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(Number(sale.descuento))}</span>
                    </div>
                  )}

                  {Number(sale.interes) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Interés:</span>
                      <span className="font-medium text-orange-600">+{formatCurrency(Number(sale.interes))}</span>
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-slate-700">Total:</span>
                    <span className="text-green-600">{formatCurrency(Number(sale.total) || 0)}</span>
                  </div>

                  {sale.tiene_cuenta_corriente && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Cuenta Corriente</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">Esta venta incluye pago con cuenta corriente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Productos vendidos */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-slate-600" />
                    Productos Vendidos
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    {sale.detalles?.length || 0} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sale.detalles && sale.detalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Producto</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Cantidad</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Precio Unit.</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sale.detalles.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Package className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{item.producto_nombre}</p>
                                  {item.producto_codigo && (
                                    <p className="text-sm text-slate-500 font-mono">{item.producto_codigo}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                                {item.cantidad}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-slate-900">
                              {formatCurrency(Number(item.precio_unitario) || 0)}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-green-600">
                              {formatCurrency(Number(item.subtotal) || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">No hay productos en esta venta</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de pago */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-slate-600" />
                    Métodos de Pago
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    {sale.pagos?.length || 0} método{sale.pagos?.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {sale.pagos && sale.pagos.length > 0 ? (
                  <div className="space-y-3">
                    {sale.pagos.map((pago, index) => {
                      const paymentType = formatPaymentType(pago.tipo_pago || pago.tipo)
                      const PaymentIcon = paymentType.icon

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-white border border-slate-200`}>
                              <PaymentIcon className={`w-4 h-4 ${paymentType.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{paymentType.label}</p>
                              {pago.descripcion && <p className="text-sm text-slate-600">{pago.descripcion}</p>}
                              {pago.movimiento_info && (
                                <p className="text-xs text-slate-500">
                                  Mov. CC: {pago.movimiento_info.numero || pago.movimiento_info.id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-lg text-slate-900">
                              {formatCurrency(Number(pago.monto))}
                            </span>
                            {pago.tipo_pago === "cuenta_corriente" && (
                              <p className="text-xs text-orange-600">Cuenta Corriente</p>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Total de pagos */}
                    <div className="border-t border-slate-200 pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Total Pagado:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(sale.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">No hay información de pagos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observaciones */}
            {sale.observaciones && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <Info className="w-4 h-4 mr-2 text-slate-600" />
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{sale.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end pt-4 border-t border-slate-200">
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SaleDetailsModal
