"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Package,
  X,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Info,
  Calendar,
  Building2,
  Phone,
  Mail,
  Ban,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { extractExactDateTime } from "@/lib/date-utils"

export default function CotizacionDetailsModal({ isOpen, onClose, cotizacion }) {
  if (!isOpen || !cotizacion) return null

  // Configuración de estados
  const statusConfig = {
    activa: {
      label: "Activa",
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    },
    aceptada: {
      label: "Aceptada",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    rechazada: {
      label: "Rechazada",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
    },
    vencida: {
      label: "Vencida",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-200",
    },
    anulada: {
      label: "Anulada",
      icon: Ban,
      color: "text-gray-600",
      bg: "bg-gray-100",
      border: "border-gray-200",
    },
  }

  const currentStatus = statusConfig[cotizacion.estado] || statusConfig.activa
  const StatusIcon = currentStatus.icon
  const dateTime = extractExactDateTime(cotizacion.fecha_creacion)

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
        {/* Modal Container */}
        <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-purple-200" />
              <span className="text-xl font-semibold">Detalles de Cotización - {cotizacion.numero_cotizacion}</span>
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
                <TabsTrigger value="condiciones">Condiciones</TabsTrigger>
              </TabsList>

              {/* Scrollable Content for Tabs */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-160px)]">
                {/* Tab General */}
                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de la cotización */}
                    <Card className="border border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Información de la Cotización</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Número:</span>
                          <span className="font-mono font-medium">{cotizacion.numero_cotizacion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha:</span>
                          <span>{dateTime.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hora:</span>
                          <span>{dateTime.time}</span>
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
                          <span>{cotizacion.usuario_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID Cotización:</span>
                          <span className="font-mono text-sm">#{cotizacion.id}</span>
                        </div>

                        {/* Información de vencimiento */}
                        {cotizacion.fecha_vencimiento && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Vencimiento</span>
                              </div>
                              <span className="text-sm text-blue-700">
                                {new Date(cotizacion.fecha_vencimiento).toLocaleDateString("es-AR")}
                              </span>
                            </div>
                            {cotizacion.dias_restantes !== null && (
                              <p
                                className={`text-xs mt-1 ${
                                  cotizacion.dias_restantes < 0
                                    ? "text-red-600"
                                    : cotizacion.dias_restantes <= 3
                                      ? "text-orange-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {cotizacion.dias_restantes < 0
                                  ? `Vencida hace ${Math.abs(cotizacion.dias_restantes)} días`
                                  : cotizacion.dias_restantes === 0
                                    ? "Vence hoy"
                                    : `${cotizacion.dias_restantes} días restantes`}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Información del cliente */}
                    <Card className="border border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <User className="h-5 w-5" />
                          <span>Cliente</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="font-medium">{cotizacion.cliente_nombre || "Cliente no especificado"}</span>
                        </div>
                        {cotizacion.cliente_telefono && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Teléfono:</span>
                            <span>{cotizacion.cliente_telefono}</span>
                          </div>
                        )}
                        {cotizacion.cliente_email && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Email:</span>
                            <span>{cotizacion.cliente_email}</span>
                          </div>
                        )}
                        {cotizacion.cliente_direccion && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Dirección:</span>
                            <span className="text-right">{cotizacion.cliente_direccion}</span>
                          </div>
                        )}
                        {cotizacion.cliente_cuit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CUIT:</span>
                            <span>{cotizacion.cliente_cuit}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Totales */}
                  <Card className="border border-purple-200 mx-auto max-w-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 justify-center">
                        <FileText className="h-5 w-5" />
                        <span>Total Cotizado</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{formatCurrency(cotizacion.total)}</p>
                        {cotizacion.subtotal !== cotizacion.total && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Subtotal: {formatCurrency(cotizacion.subtotal)}</p>
                            {cotizacion.descuento > 0 && (
                              <p className="text-green-600">Descuento: -{formatCurrency(cotizacion.descuento)}</p>
                            )}
                            {cotizacion.interes > 0 && (
                              <p className="text-red-600">Interés: +{formatCurrency(cotizacion.interes)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observaciones */}
                  {cotizacion.observaciones && (
                    <Card className="border border-purple-200">
                      <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{cotizacion.observaciones}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab Productos */}
                <TabsContent value="productos" className="mt-0">
                  <Card className="border border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Productos Cotizados ({cotizacion.detalles?.length || 0})</span>
                      </CardTitle>
                      <CardDescription>Detalle de productos incluidos en la cotización</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cotizacion.detalles && cotizacion.detalles.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Descuento</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cotizacion.detalles.map((detalle, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{detalle.producto_nombre}</div>
                                      <div className="text-sm text-gray-500">
                                        {detalle.producto_codigo} • {detalle.producto_marca || "Sin marca"}
                                      </div>
                                      {detalle.descripcion_personalizada && (
                                        <div className="text-xs text-blue-600 mt-1 italic">
                                          {detalle.descripcion_personalizada}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline">{detalle.cantidad}</Badge>
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
                          <p className="text-muted-foreground">Esta cotización no tiene productos registrados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Condiciones */}
                <TabsContent value="condiciones" className="mt-0">
                  <div className="space-y-6">
                    {/* Condiciones comerciales */}
                    <Card className="border border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Info className="h-5 w-5" />
                          <span>Condiciones Comerciales</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {cotizacion.condiciones_comerciales ? (
                          <p className="text-gray-700 whitespace-pre-wrap">{cotizacion.condiciones_comerciales}</p>
                        ) : (
                          <p className="text-gray-500 italic">No se especificaron condiciones comerciales</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Información de entrega y validez */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border border-purple-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Tiempo de Entrega</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{cotizacion.tiempo_entrega || "No especificado"}</p>
                        </CardContent>
                      </Card>

                      <Card className="border border-purple-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Validez</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{cotizacion.validez_dias} días</p>
                          {cotizacion.fecha_vencimiento && (
                            <p className="text-sm text-gray-500 mt-1">
                              Válida hasta: {new Date(cotizacion.fecha_vencimiento).toLocaleDateString("es-AR")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Datos de la empresa */}
                    {cotizacion.empresa_datos && (
                      <Card className="border border-purple-200">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5" />
                            <span>Datos de la Empresa</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{cotizacion.empresa_datos.nombre}</h4>
                              {cotizacion.empresa_datos.direccion && (
                                <p className="text-sm text-gray-600 mt-1">{cotizacion.empresa_datos.direccion}</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              {cotizacion.empresa_datos.telefono && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {cotizacion.empresa_datos.telefono}
                                </div>
                              )}
                              {cotizacion.empresa_datos.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {cotizacion.empresa_datos.email}
                                </div>
                              )}
                              {cotizacion.empresa_datos.cuit && (
                                <p className="text-sm text-gray-600">CUIT: {cotizacion.empresa_datos.cuit}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t">
            <Button variant="outline" onClick={onClose} className="border-purple-200 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
