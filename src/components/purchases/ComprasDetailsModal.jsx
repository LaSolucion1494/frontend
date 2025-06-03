"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  Calendar,
  User,
  FileText,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Truck,
} from "lucide-react"

import { usePurchases } from "../../hooks/usePurchase"

// Componente para formatear precios
const PriceDisplay = ({ value, className = "" }) => {
  return (
    <span className={className}>
      {new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(value || 0)}
    </span>
  )
}

export default function CompraDetailModal({ isOpen, onClose, purchase, onStatusChange }) {
  const { getPurchaseById } = usePurchases()
  const [detailedPurchase, setDetailedPurchase] = useState(null)
  const [loading, setLoading] = useState(false)

  // Cargar detalles de la compra cuando se abre el modal
  useEffect(() => {
    if (isOpen && purchase?.id) {
      loadPurchaseDetails()
    }
  }, [isOpen, purchase?.id])

  const loadPurchaseDetails = async () => {
    setLoading(true)
    try {
      const result = await getPurchaseById(purchase.id)
      if (result.success) {
        setDetailedPurchase(result.data)
      }
    } catch (error) {
      console.error("Error loading purchase details:", error)
    } finally {
      setLoading(false)
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { variant: "secondary", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
      parcial: { variant: "secondary", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
      recibida: { variant: "secondary", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
      cancelada: { variant: "secondary", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
    }

    const config = statusConfig[estado] || statusConfig.pendiente
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`flex items-center space-x-1 ${config.bg}`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="capitalize">{estado}</span>
      </Badge>
    )
  }

  if (!purchase) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Detalle de Compra - {purchase.numero_compra}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : detailedPurchase ? (
          <div className="space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {new Date(detailedPurchase.fecha_compra).toLocaleDateString("es-AR")}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Proveedor:</span>
                  <span className="font-medium">{detailedPurchase.proveedor_nombre}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Usuario:</span>
                  <span className="font-medium">{detailedPurchase.usuario_nombre}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Estado:</span>
                  {getStatusBadge(detailedPurchase.estado)}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <PriceDisplay value={detailedPurchase.total} className="font-bold text-lg text-green-600" />
                </div>

                {(detailedPurchase.estado === "pendiente" || detailedPurchase.estado === "parcial") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(detailedPurchase)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Cambiar Estado</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Observaciones */}
            {detailedPurchase.observaciones && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Observaciones:</span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{detailedPurchase.observaciones}</p>
              </div>
            )}

            <Separator />

            {/* Detalles de productos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Productos</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-center">Recibida</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedPurchase.detalles?.map((detalle) => (
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
                          <Badge variant={detalle.cantidad_recibida === detalle.cantidad ? "default" : "secondary"}>
                            {detalle.cantidad_recibida}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <PriceDisplay value={detalle.precio_unitario} />
                        </TableCell>
                        <TableCell className="text-right">
                          <PriceDisplay value={detalle.subtotal} className="font-medium" />
                        </TableCell>
                        <TableCell className="text-center">
                          {detalle.cantidad_recibida === 0 ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-600">
                              Pendiente
                            </Badge>
                          ) : detalle.cantidad_recibida === detalle.cantidad ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-600">
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-600">
                              Parcial
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* Totales */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <PriceDisplay value={detailedPurchase.subtotal} />
                </div>
                {detailedPurchase.descuento > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <PriceDisplay value={detailedPurchase.descuento} />
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <PriceDisplay value={detailedPurchase.total} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Error al cargar los detalles de la compra</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
