"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle2, X, Truck, AlertCircle, Info, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useSales } from "@/hooks/useSales"

const DeliverProductsModal = ({ isOpen, onClose, sale, onDeliveryComplete }) => {
  const { deliverProducts, loading: delivering } = useSales()
  const [deliveryQuantities, setDeliveryQuantities] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && sale) {
      const initialQuantities = {}
      sale.detalles.forEach((detail) => {
        initialQuantities[detail.id] = "" // Campo vacío para la cantidad a entregar
      })
      setDeliveryQuantities(initialQuantities)
      setErrors({})
    }
  }, [isOpen, sale])

  if (!isOpen || !sale) return null

  const handleQuantityChange = (detalleId, value) => {
    const numValue = Number.parseInt(value)
    setDeliveryQuantities((prev) => ({
      ...prev,
      [detalleId]: value, // Mantener el string para permitir vacío o "0"
    }))
    // Limpiar error específico si el usuario empieza a corregir
    if (errors[detalleId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[detalleId]
        return newErrors
      })
    }
  }

  const validateDeliveries = () => {
    const newErrors = {}
    let hasValidDelivery = false

    sale.detalles.forEach((detail) => {
      const quantityToDeliver = Number.parseInt(deliveryQuantities[detail.id]) || 0
      const remaining = detail.cantidad - detail.cantidad_entregada

      if (quantityToDeliver < 0) {
        newErrors[detail.id] = "La cantidad no puede ser negativa."
      } else if (quantityToDeliver > remaining) {
        newErrors[detail.id] = `Máximo ${remaining} unidades pendientes.`
      } else if (quantityToDeliver > 0) {
        hasValidDelivery = true
      }
    })

    if (!hasValidDelivery && Object.keys(newErrors).length === 0) {
      newErrors.general = "Debe especificar al menos una cantidad a entregar."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 && hasValidDelivery
  }

  const handleConfirmDelivery = async () => {
    if (!validateDeliveries()) {
      return
    }

    const deliveriesToSend = Object.keys(deliveryQuantities)
      .map((detalleId) => ({
        detalleId: Number.parseInt(detalleId),
        quantity: Number.parseInt(deliveryQuantities[detalleId]) || 0,
      }))
      .filter((d) => d.quantity > 0) // Solo enviar los que tienen cantidad > 0

    if (deliveriesToSend.length === 0) {
      toast.error("No hay productos seleccionados para entregar.")
      return
    }

    const result = await deliverProducts(sale.id, deliveriesToSend)

    if (result.success) {
      toast.success(result.message)
      onDeliveryComplete(sale.id, result.data.newStatus) // Pasar el nuevo estado de la venta
      onClose()
    } else {
      toast.error(result.message || "Error al registrar la entrega.")
    }
  }

  const totalPendingItems = sale.detalles.reduce((sum, d) => sum + (d.cantidad - d.cantidad_entregada), 0)
  const totalDeliveredItems = sale.detalles.reduce((sum, d) => sum + d.cantidad_entregada, 0)
  const totalItemsInSale = sale.detalles.reduce((sum, d) => sum + d.cantidad, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Entregar Productos de Venta</h2>
              <p className="text-sm text-slate-300 mt-1">
                Venta: <span className="font-mono">{sale.numero_factura}</span> | Cliente:{" "}
                {sale.cliente_nombre || "N/A"}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={delivering}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-slate-600" />
                  Productos de la Venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Entregado</TableHead>
                        <TableHead className="text-center">Pendiente</TableHead>
                        <TableHead className="text-center">Entregar Ahora</TableHead>
                        <TableHead className="text-center">Stock Actual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.detalles.map((detail) => {
                        const remaining = detail.cantidad - detail.cantidad_entregada
                        const isFullyDelivered = remaining <= 0
                        const hasStockIssue = detail.producto_stock_actual < remaining && !isFullyDelivered

                        return (
                          <TableRow key={detail.id} className={isFullyDelivered ? "bg-green-50" : ""}>
                            <TableCell>
                              <div className="font-medium">{detail.producto_nombre}</div>
                              <div className="text-sm text-gray-500">{detail.producto_codigo}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{detail.cantidad}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {detail.cantidad_entregada}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={
                                  isFullyDelivered
                                    ? "bg-green-200 text-green-800"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }
                              >
                                {remaining}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {isFullyDelivered ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={remaining}
                                    value={deliveryQuantities[detail.id]}
                                    onChange={(e) => handleQuantityChange(detail.id, e.target.value)}
                                    className={`w-24 text-center text-sm ${
                                      errors[detail.id] ? "border-red-500" : "border-slate-300"
                                    }`}
                                    disabled={delivering}
                                  />
                                  {errors[detail.id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[detail.id]}</p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={
                                  detail.producto_stock_actual <= 0
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : detail.producto_stock_actual < remaining && !isFullyDelivered
                                      ? "bg-amber-100 text-amber-700 border-amber-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {detail.producto_stock_actual}
                              </Badge>
                              {hasStockIssue && (
                                <div className="flex items-center justify-center text-amber-600 text-xs mt-1">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Bajo stock
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {Object.keys(errors).length > 0 && errors.general && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-red-800 text-sm">Error:</p>
                    <p className="text-xs text-red-700">• {errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <Card className="border-slate-200 shadow-sm bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-800">Resumen de Entrega</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      Total Pendiente: <span className="font-semibold">{totalPendingItems} unidades</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Total Entregado: <span className="font-semibold">{totalDeliveredItems} unidades</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Total en Venta: <span className="font-semibold">{totalItemsInSale} unidades</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t border-slate-300 bg-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={delivering}
            className="px-6 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelivery}
            disabled={delivering || Object.keys(errors).length > 0}
            className="px-6 h-10 bg-slate-800 hover:bg-slate-700 text-white text-sm"
          >
            {delivering ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entregando...
              </div>
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Confirmar Entrega
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeliverProductsModal
