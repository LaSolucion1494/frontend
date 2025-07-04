"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  X,
  FileText,
  Building,
  CreditCard,
  ShoppingCart,
  Package,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Banknote,
  Smartphone,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
} from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { extractExactDateTime } from "../../lib/date-utils"

const PurchaseDetailsModal = ({ isOpen, onClose, purchase, onStatusChange }) => {
  if (!purchase) return null

  // Función para formatear tipos de pago
  const formatPaymentType = (type) => {
    const types = {
      efectivo: { label: "Efectivo", icon: Banknote, color: "text-green-600" },
      tarjeta_credito: { label: "Tarjeta Crédito", icon: CreditCard, color: "text-blue-600" },
      tarjeta_debito: { label: "Tarjeta Débito", icon: CreditCard, color: "text-indigo-600" },
      transferencia: { label: "Transferencia", icon: Smartphone, color: "text-purple-600" },
      otro: { label: "Otro", icon: DollarSign, color: "text-gray-600" },
    }
    return types[type] || { label: type, icon: DollarSign, color: "text-gray-600" }
  }

  // Función para obtener el estado de la compra
  const getEstadoCompra = (estado) => {
    switch (estado) {
      case "recibida":
        return {
          label: "Recibida",
          icon: CheckCircle2,
          color: "bg-green-100 text-green-800 border-green-200",
        }
      case "pendiente":
        return {
          label: "Pendiente",
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        }
      case "parcial":
        return {
          label: "Parcial",
          icon: AlertTriangle,
          color: "bg-orange-100 text-orange-800 border-orange-200",
        }
      case "cancelada":
        return {
          label: "Cancelada",
          icon: XCircle,
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

  const estadoCompra = getEstadoCompra(purchase.estado)
  const EstadoIcon = estadoCompra.icon
  const dateTime = extractExactDateTime(purchase.fecha_creacion)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200">
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Detalles de Compra</span>
              <p className="text-sm text-slate-600 font-normal mt-1">Número: {purchase.numero_compra}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-4">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información de la compra */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-slate-600" />
                    Información de la Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Número:</span>
                    <span className="font-mono font-semibold text-slate-900">{purchase.numero_compra}</span>
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
                    <Badge className={`${estadoCompra.color} border font-medium`}>
                      <EstadoIcon className="w-3 h-3 mr-1" />
                      {estadoCompra.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Usuario:</span>
                    <span className="font-medium text-slate-900">{purchase.usuario_nombre}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">ID Compra:</span>
                    <span className="font-mono text-sm text-slate-700">#{purchase.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Información del proveedor */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <Building className="w-4 h-4 mr-2 text-slate-600" />
                    Proveedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <span className="text-slate-600 text-sm">Nombre:</span>
                    <p className="font-medium text-slate-900 mt-1">
                      {purchase.proveedor_nombre || "Proveedor no especificado"}
                    </p>
                  </div>

                  {purchase.proveedor_telefono && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{purchase.proveedor_telefono}</span>
                    </div>
                  )}

                  {purchase.proveedor_email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{purchase.proveedor_email}</span>
                    </div>
                  )}

                  {purchase.proveedor_direccion && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-sm text-slate-600">{purchase.proveedor_direccion}</span>
                    </div>
                  )}

                  {purchase.proveedor_cuit && (
                    <div>
                      <span className="text-slate-600 text-sm">CUIT:</span>
                      <p className="font-mono text-sm text-slate-700 mt-1">{purchase.proveedor_cuit}</p>
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
                    <span className="font-medium text-slate-900">{formatCurrency(Number(purchase.subtotal) || 0)}</span>
                  </div>

                  {Number(purchase.descuento) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Descuento:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(Number(purchase.descuento))}</span>
                    </div>
                  )}

                  {Number(purchase.interes) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">Interés:</span>
                      <span className="font-medium text-orange-600">+{formatCurrency(Number(purchase.interes))}</span>
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-slate-700">Total:</span>
                    <span className="text-green-600">{formatCurrency(Number(purchase.total) || 0)}</span>
                  </div>

                  {(purchase.estado === "pendiente" || purchase.estado === "parcial") && onStatusChange && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Gestión de Estado</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onStatusChange(purchase.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Cambiar Estado
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Productos comprados */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-slate-600" />
                    Productos Comprados
                  </div>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    {purchase.detalles?.length || 0} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {purchase.detalles && purchase.detalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Producto</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Cantidad</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Recibida</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Precio Unit.</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Subtotal</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchase.detalles.map((item, index) => (
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
                            <td className="py-4 px-4 text-center">
                              <Badge
                                variant="secondary"
                                className={
                                  item.cantidad_recibida === item.cantidad
                                    ? "bg-green-100 text-green-800"
                                    : item.cantidad_recibida > 0
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {item.cantidad_recibida || 0}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-slate-900">
                              {formatCurrency(Number(item.precio_unitario) || 0)}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-green-600">
                              {formatCurrency(Number(item.subtotal) || 0)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {item.cantidad_recibida === 0 ? (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendiente
                                </Badge>
                              ) : item.cantidad_recibida === item.cantidad ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completo
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Parcial
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">No hay productos en esta compra</p>
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
                    {purchase.pagos?.length || 0} método{purchase.pagos?.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {purchase.pagos && purchase.pagos.length > 0 ? (
                  <div className="space-y-3">
                    {purchase.pagos.map((pago, index) => {
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
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-lg text-slate-900">
                              {formatCurrency(Number(pago.monto))}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Total de pagos */}
                    <div className="border-t border-slate-200 pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Total Pagado:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(purchase.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0))}
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
            {purchase.observaciones && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center">
                    <Info className="w-4 h-4 mr-2 text-slate-600" />
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{purchase.observaciones}</p>
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

export default PurchaseDetailsModal
