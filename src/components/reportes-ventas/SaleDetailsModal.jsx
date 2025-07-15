"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Package,
  CreditCard,
  DollarSign,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Banknote,
  Smartphone,
  Building,
  Receipt,
  Info,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { extractExactDateTime } from "@/lib/date-utils"

export default function SaleDetailsModal({ isOpen, onClose, sale }) {
  if (!isOpen || !sale) return null

  // Configuración de estados
  const statusConfig = {
    completada: {
      label: "Completada",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    anulada: {
      label: "Anulada",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
    },
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      border: "border-yellow-200",
    },
  }

  // Configuración de métodos de pago
  const paymentConfig = {
    efectivo: {
      label: "Efectivo",
      icon: Banknote,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    transferencia: {
      label: "Transferencia",
      icon: Smartphone,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    tarjeta: {
      label: "Tarjeta",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    cuenta_corriente: {
      label: "Cuenta Corriente",
      icon: Building,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    otro: {
      label: "Otro",
      icon: DollarSign,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  }

  const currentStatus = statusConfig[sale.estado] || statusConfig.pendiente
  const StatusIcon = currentStatus.icon
  const dateTime = extractExactDateTime(sale.fecha_creacion)

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
        {/* Modal Container */}
        <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-slate-800 text-white">
            <div className="flex items-center space-x-3">
              <Receipt className="h-6 w-6 text-blue-300" />
              <span className="text-xl font-semibold">Detalles de Venta - {sale.numero_factura}</span>
            </div>
            <Badge variant="secondary" className={`${currentStatus.bg} ${currentStatus.border}`}>
              <StatusIcon className={`h-4 w-4 mr-2 ${currentStatus.color}`} />
              <span className={currentStatus.color}>{currentStatus.label}</span>
            </Badge>
          </div>

          {/* Tabs and Scrollable Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="general" className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="productos">Productos</TabsTrigger>
                <TabsTrigger value="pagos">Pagos</TabsTrigger>
              </TabsList>
              {/* Scrollable Content for Tabs */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-160px)]">
                {/* Tab General */}
                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de la venta */}
                    <Card className="border border-slate-800">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Receipt className="h-5 w-5" />
                          <span>Información de la Venta</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Número:</span>
                          <span className="font-mono font-medium">{sale.numero_factura}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha:</span>
                          <span>{dateTime.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <Badge variant="secondary" className={`${currentStatus.bg}`}>
                            <StatusIcon className={`h-3 w-3 mr-1 ${currentStatus.color}`} />
                            <span className={currentStatus.color}>{currentStatus.label}</span>
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Usuario:</span>
                          <span>{sale.usuario_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID Venta:</span>
                          <span className="font-mono text-sm">#{sale.id}</span>
                        </div>
                        {sale.tiene_cuenta_corriente && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Incluye Cuenta Corriente</span>
                            </div>
                            <p className="text-xs text-orange-700 mt-1">Esta venta incluye pago con cuenta corriente</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Información del cliente */}
                    <Card className="border border-slate-800">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Cliente</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="font-medium">{sale.cliente_nombre || "Cliente no especificado"}</span>
                        </div>
                        {sale.cliente_telefono && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Teléfono:</span>
                            <span>{sale.cliente_telefono}</span>
                          </div>
                        )}
                        {sale.cliente_email && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span>{sale.cliente_email}</span>
                          </div>
                        )}
                        {sale.cliente_direccion && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Dirección:</span>
                            <span className="text-right">{sale.cliente_direccion}</span>
                          </div>
                        )}
                        {sale.cliente_cuit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CUIT:</span>
                            <span>{sale.cliente_cuit}</span>
                          </div>
                        )}
                        {sale.cliente_nombre === "Consumidor Final" && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Info className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800">Venta Rápida</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Totales */}
                  <Card className="border border-slate-800 mx-auto max-w-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 justify-center">
                        <DollarSign className="h-5 w-5" />
                        <span>Total</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(sale.total)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observaciones */}
                  {sale.observaciones && (
                    <Card className="border border-slate-800">
                      <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{sale.observaciones}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab Productos */}
                <TabsContent value="productos" className="mt-0">
                  <Card className="border border-slate-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Productos Vendidos ({sale.detalles?.length || 0})</span>
                      </CardTitle>
                      <CardDescription>Detalle de productos incluidos en la venta</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sale.detalles && sale.detalles.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-center">Entregado</TableHead> {/* Nueva columna */}
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Descuento</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sale.detalles.map((detalle, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{detalle.producto_nombre}</div>
                                      <div className="text-sm text-gray-500">
                                        {detalle.producto_codigo} • {detalle.producto_marca || "Sin marca"}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline">{detalle.cantidad}</Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="secondary"
                                      className={
                                        detalle.cantidad_entregada === detalle.cantidad
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }
                                    >
                                      {detalle.cantidad_entregada}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(Number(detalle.precio_unitario) || 0)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {detalle.discount_percentage > 0 ? (
                                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                        -{detalle.discount_percentage}%
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(Number(detalle.subtotal) || 0)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay productos</h3>
                          <p className="text-muted-foreground">Esta venta no tiene productos registrados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Pagos */}
                <TabsContent value="pagos" className="mt-0">
                  <Card className="border border-slate-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Métodos de Pago ({sale.pagos?.length || 0})</span>
                      </CardTitle>
                      <CardDescription>Detalle de los métodos de pago utilizados en la venta</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sale.pagos && sale.pagos.length > 0 ? (
                        <div className="space-y-4">
                          {sale.pagos.map((pago, index) => {
                            const config = paymentConfig[pago.tipo_pago] || paymentConfig.otro
                            const PaymentIcon = config.icon
                            const pagoDateTime = extractExactDateTime(pago.fecha_creacion)

                            return (
                              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${config.bg}`}>
                                    <PaymentIcon className={`h-4 w-4 ${config.color}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{config.label}</p>
                                    {pago.descripcion && <p className="text-sm text-gray-500">{pago.descripcion}</p>}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>Fecha: {pagoDateTime.date}</span>
                                      <span>Hora: {pagoDateTime.time}</span>
                                    </div>
                                    {pago.movimiento_cuenta_id && (
                                      <p className="text-xs text-orange-600 mt-1">
                                        Mov. CC: #{pago.movimiento_cuenta_id}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{formatCurrency(Number(pago.monto))}</p>
                                  {pago.tipo_pago === "cuenta_corriente" && (
                                    <p className="text-xs text-orange-600 mt-1">Cuenta Corriente</p>
                                  )}
                                </div>
                              </div>
                            )
                          })}

                          {/* Resumen de pagos */}
                          <div className="border-t pt-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-700">Total Pagado:</span>
                                  <span className="font-bold text-xl text-blue-900">
                                    {formatCurrency(sale.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0))}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-700">Total Venta:</span>
                                  <span className="font-bold text-xl text-green-900">
                                    {formatCurrency(Number(sale.total) || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Verificación de pagos */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-center space-x-2">
                                {Math.abs(
                                  sale.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0) - Number(sale.total),
                                ) < 0.01 ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-700">Pagos verificados correctamente</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-700">Diferencia en pagos detectada</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay métodos de pago</h3>
                          <p className="text-muted-foreground">Esta venta no tiene información de pagos registrada</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t">
            <Button variant="outline" onClick={onClose} className="border-slate-800 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
