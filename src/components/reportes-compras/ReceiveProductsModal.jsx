"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components
import { Package, Plus, Minus, CheckCircle, AlertCircle, Truck, X } from "lucide-react" // Added X icon
import { formatCurrency } from "@/lib/utils" // Assuming formatCurrency is in lib/utils
import { usePurchases } from "@/hooks/usePurchase" // Assuming usePurchases is in hooks/usePurchase
import toast from "react-hot-toast"

export default function ReceiveProductsModal({ isOpen, onClose, purchase, onReceive }) {
  const { getPurchaseById } = usePurchases()
  const [detailedPurchase, setDetailedPurchase] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [receiveData, setReceiveData] = useState([])

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
        // Inicializar datos de recepción solo para productos pendientes
        const pendingItems = result.data.detalles?.filter((detalle) => detalle.cantidad_recibida < detalle.cantidad)
        setReceiveData(
          pendingItems?.map((detalle) => ({
            detalleId: detalle.id,
            cantidadPendiente: detalle.cantidad - detalle.cantidad_recibida,
            cantidadRecibida: 0,
            producto: detalle,
          })) || [],
        )
      }
    } catch (error) {
      console.error("Error loading purchase details:", error)
      toast.error("Error al cargar los detalles de la compra")
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cantidad a recibir
  const updateReceiveQuantity = (detalleId, cantidad) => {
    setReceiveData((prev) =>
      prev.map((item) =>
        item.detalleId === detalleId
          ? {
              ...item,
              cantidadRecibida: Math.max(0, Math.min(cantidad, item.cantidadPendiente)),
            }
          : item,
      ),
    )
  }

  // Incrementar cantidad
  const incrementQuantity = (detalleId) => {
    const item = receiveData.find((item) => item.detalleId === detalleId)
    if (item && item.cantidadRecibida < item.cantidadPendiente) {
      updateReceiveQuantity(detalleId, item.cantidadRecibida + 1)
    }
  }

  // Decrementar cantidad
  const decrementQuantity = (detalleId) => {
    const item = receiveData.find((item) => item.detalleId === detalleId)
    if (item && item.cantidadRecibida > 0) {
      updateReceiveQuantity(detalleId, item.cantidadRecibida - 1)
    }
  }

  // Recibir todo pendiente
  const receiveAllPending = () => {
    setReceiveData((prev) =>
      prev.map((item) => ({
        ...item,
        cantidadRecibida: item.cantidadPendiente,
      })),
    )
  }

  // Limpiar cantidades
  const clearQuantities = () => {
    setReceiveData((prev) =>
      prev.map((item) => ({
        ...item,
        cantidadRecibida: 0,
      })),
    )
  }

  // Confirmar recepción
  const handleConfirmReceive = async () => {
    // Validar que hay productos para recibir
    const itemsToReceive = receiveData.filter((item) => item.cantidadRecibida > 0)

    if (itemsToReceive.length === 0) {
      toast.error("Debe especificar al menos un producto para recibir")
      return
    }

    setSaving(true)
    try {
      const detallesRecibidos = itemsToReceive.map((item) => ({
        detalleId: item.detalleId,
        cantidadRecibida: item.cantidadRecibida,
      }))

      const result = await onReceive(purchase.id, { detallesRecibidos })

      if (result.success) {
        toast.success("Productos recibidos exitosamente")
        onClose()
      }
    } catch (error) {
      console.error("Error receiving products:", error)
      toast.error("Error al recibir productos")
    } finally {
      setSaving(false)
    }
  }

  // Calcular totales
  const totalItemsToReceive = receiveData.reduce((sum, item) => sum + item.cantidadRecibida, 0)
  const totalValueToReceive = receiveData.reduce(
    (sum, item) => sum + item.cantidadRecibida * item.producto.precio_unitario,
    0,
  )

  if (!isOpen || !purchase) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
        {/* Modal Container */}
        <div className="bg-white shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-slate-800 text-white">
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-green-300" /> {/* Adjusted icon color for contrast */}
              <span className="text-xl font-semibold">Recibir Productos - {purchase.numero_compra}</span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : detailedPurchase ? (
              <div className="space-y-6">
                {/* Información de la compra */}
                <Card className="border border-slate-800">
                  <CardHeader>
                    <CardTitle>Información de la Compra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Proveedor:</span>
                        <p className="font-medium">{detailedPurchase.proveedor_nombre}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Fecha:</span>
                        <p className="font-medium">
                          {new Date(detailedPurchase.fecha_compra).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-bold text-green-600">{formatCurrency(detailedPurchase.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {receiveData.length > 0 ? (
                  <>
                    {/* Controles rápidos */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Productos Pendientes de Recepción</h3>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={clearQuantities}>
                          Limpiar
                        </Button>
                        <Button variant="outline" size="sm" onClick={receiveAllPending}>
                          Recibir Todo
                        </Button>
                      </div>
                    </div>

                    {/* Tabla de productos */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Pendiente</TableHead>
                            <TableHead className="text-center">A Recibir</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiveData.map((item) => (
                            <TableRow key={item.detalleId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.producto.producto_nombre}</div>
                                  <div className="text-sm text-gray-500">
                                    {item.producto.producto_codigo} • {item.producto.producto_marca || "Sin marca"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                  {item.cantidadPendiente}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => decrementQuantity(item.detalleId)}
                                    disabled={item.cantidadRecibida <= 0}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={item.cantidadPendiente}
                                    value={item.cantidadRecibida}
                                    onChange={(e) =>
                                      updateReceiveQuantity(item.detalleId, Number.parseInt(e.target.value) || 0)
                                    }
                                    className="w-20 text-center h-8"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => incrementQuantity(item.detalleId)}
                                    disabled={item.cantidadRecibida >= item.cantidadPendiente}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.producto.precio_unitario)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={item.cantidadRecibida > 0 ? "font-medium text-green-600" : "text-gray-400"}
                                >
                                  {formatCurrency(item.cantidadRecibida * item.producto.precio_unitario)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Resumen de recepción */}
                    {totalItemsToReceive > 0 && (
                      <Card className="p-4 bg-green-50 rounded-lg border border-slate-800">
                        {" "}
                        {/* Changed border to slate-800 */}
                        <CardHeader className="p-0 pb-3">
                          <CardTitle className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold text-green-800">Resumen de Recepción</h4>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-green-700">Total de productos a recibir:</span>
                              <p className="font-bold text-green-800">{totalItemsToReceive} unidades</p>
                            </div>
                            <div>
                              <span className="text-sm text-green-700">Valor total a recibir:</span>
                              <span className="font-bold text-green-800">{formatCurrency(totalValueToReceive)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Alerta informativa */}
                    <Alert className="border border-slate-800">
                      {" "}
                      {/* Added border */}
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Al confirmar la recepción, se actualizará automáticamente el stock de los productos y se
                        registrarán los movimientos correspondientes.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Todos los productos recibidos</h3>
                    <p className="text-gray-500">Esta compra ya tiene todos sus productos completamente recibidos.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Error al cargar los detalles de la compra</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving} className="border-slate-800">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            {receiveData.length > 0 && totalItemsToReceive > 0 && (
              <Button onClick={handleConfirmReceive} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Recepción
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
