"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Building,
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
} from "lucide-react"
import { formatCurrency } from "@/lib/utils" // Assuming formatCurrency is in lib/utils
import ReceiveProductsModal from "./ReceiveProductsModal" // Assuming these are in the same components folder

export default function PurchaseDetailsModal({ isOpen, onClose, purchase, onReceive }) {
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  if (!isOpen || !purchase) return null

  // Configuración de estados
  const statusConfig = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      border: "border-yellow-200",
    },
    parcial: {
      label: "Parcial",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-200",
    },
    recibida: {
      label: "Recibida",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    cancelada: {
      label: "Cancelada",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
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
    tarjeta_credito: {
      label: "Tarjeta Crédito",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    tarjeta_debito: {
      label: "Tarjeta Débito",
      icon: CreditCard,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
    otro: {
      label: "Otro",
      icon: DollarSign,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  }

  const currentStatus = statusConfig[purchase.estado] || statusConfig.pendiente
  const StatusIcon = currentStatus.icon

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
        {/* Modal Container */}
        <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-slate-800 text-white">
            {" "}
            {/* Added bg-slate-800 and text-white */}
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-300" /> {/* Adjusted icon color for contrast */}
              <span className="text-xl font-semibold">Detalles de Compra - {purchase.numero_compra}</span>
            </div>
            <Badge variant="secondary" className={`${currentStatus.bg} ${currentStatus.border}`}>
              <StatusIcon className={`h-4 w-4 mr-2 ${currentStatus.color}`} />
              <span className={currentStatus.color}>{currentStatus.label}</span>
            </Badge>
          </div>

          {/* Tabs and Scrollable Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="general" className="w-full h-full flex flex-col">
              {" "}
              {/* Added h-full and flex flex-col */}
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="productos">Productos</TabsTrigger>
                <TabsTrigger value="pagos">Pagos</TabsTrigger>
              </TabsList>
              {/* Scrollable Content for Tabs */}
              {/* Added max-h-[calc(90vh-160px)] to ensure scrollability */}
              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-160px)]">
                {/* Tab General */}
                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de la compra */}
                    <Card className="border border-slate-800">
                      {" "}
                      {/* Added border */}
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Información de la Compra</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Número:</span>
                          <span className="font-mono font-medium">{purchase.numero_compra}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha:</span>
                          <span>{new Date(purchase.fecha_compra).toLocaleDateString("es-AR")}</span>
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
                          <span>{purchase.usuario_nombre}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Información del proveedor */}
                    <Card className="border border-slate-800">
                      {" "}
                      {/* Added border */}
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Building className="h-5 w-5" />
                          <span>Proveedor</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="font-medium">{purchase.proveedor_nombre}</span>
                        </div>
                        {purchase.proveedor_cuit && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CUIT:</span>
                            <span>{purchase.proveedor_cuit}</span>
                          </div>
                        )}
                        {purchase.proveedor_telefono && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Teléfono:</span>
                            <span>{purchase.proveedor_telefono}</span>
                          </div>
                        )}
                        {purchase.proveedor_direccion && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Dirección:</span>
                            <span className="text-right">{purchase.proveedor_direccion}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Totales */}
                  <Card className="border border-slate-800 mx-auto max-w-sm">
                    {" "}
                    {/* Added border, mx-auto, and max-w-sm */}
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 justify-center">
                        {" "}
                        {/* Centered title */}
                        <DollarSign className="h-5 w-5" />
                        <span>Total</span> {/* Changed title to "Total" */}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {" "}
                        {/* Centered content */}
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(purchase.total)}</p>{" "}
                        {/* Only total */}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observaciones */}
                  {purchase.observaciones && (
                    <Card className="border border-slate-800">
                      {" "}
                      {/* Added border */}
                      <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{purchase.observaciones}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab Productos */}
                <TabsContent value="productos" className="mt-0">
                  <Card className="border border-slate-800">
                    {" "}
                    {/* Added border */}
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Productos ({purchase.detalles?.length || 0})</span>
                      </CardTitle>
                      <CardDescription>Detalle de productos incluidos en la compra</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-center">Recibida</TableHead>
                              <TableHead className="text-center">Pendiente</TableHead>
                              <TableHead className="text-right">Precio Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchase.detalles?.map((detalle) => {
                              const pendiente = detalle.cantidad - detalle.cantidad_recibida
                              return (
                                <TableRow key={detalle.id}>
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
                                      variant="outline"
                                      className={
                                        detalle.cantidad_recibida === detalle.cantidad
                                          ? "bg-green-100 text-green-700 border-green-200"
                                          : detalle.cantidad_recibida > 0
                                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                            : "bg-gray-100 text-gray-700 border-gray-200"
                                      }
                                    >
                                      {detalle.cantidad_recibida}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={
                                        pendiente === 0
                                          ? "bg-green-100 text-green-700 border-green-200"
                                          : "bg-red-100 text-red-700 border-red-200"
                                      }
                                    >
                                      {pendiente}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(detalle.precio_unitario)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(detalle.subtotal)}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Pagos */}
                <TabsContent value="pagos" className="mt-0">
                  <Card className="border border-slate-800">
                    {" "}
                    {/* Added border */}
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Métodos de Pago ({purchase.pagos?.length || 0})</span>
                      </CardTitle>
                      <CardDescription>Detalle de los métodos de pago utilizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {purchase.pagos?.map((pago, index) => {
                          const config = paymentConfig[pago.tipo_pago] || paymentConfig.otro
                          const PaymentIcon = config.icon
                          return (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${config.bg}`}>
                                  <PaymentIcon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{config.label}</p>
                                  {pago.descripcion && <p className="text-sm text-gray-500">{pago.descripcion}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(pago.monto)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(pago.fecha_creacion).toLocaleDateString("es-AR")}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t">
            <Button variant="outline" onClick={onClose} className="border-slate-800">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      <ReceiveProductsModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        purchase={purchase}
        onReceive={onReceive}
      />
    </>
  )
}
