"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { CheckCircle, Receipt, User, ShoppingCart, CreditCard, Download, PrinterIcon as Print } from "lucide-react"
import { formatCurrency, formatDateTime } from "../../lib/utils"

const SaleConfirmation = ({ saleResult, client, cartItems, paymentData, total, onFinish }) => {
  const handlePrint = () => {
    // Aquí podrías implementar la funcionalidad de impresión
    window.print()
  }

  const handleDownload = () => {
    // Aquí podrías implementar la descarga del comprobante
    console.log("Descargar comprobante")
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header de éxito */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Venta Completada!</h2>
          <p className="text-slate-600">La venta se ha procesado exitosamente</p>
        </div>

        {/* Información de la venta */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-2">
              <p className="text-sm text-green-700">Número de Factura</p>
              <p className="text-2xl font-bold text-green-800 font-mono">{saleResult?.numeroFactura}</p>
              <p className="text-sm text-green-600">{formatDateTime(new Date())}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detalles de la venta */}
        <div className="space-y-4">
          {/* Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{client.nombre}</p>
                {client.telefono && <p className="text-sm text-slate-600">{client.telefono}</p>}
                {client.email && <p className="text-sm text-slate-600">{client.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Productos Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.producto_id}
                    className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.producto_nombre}</p>
                      <p className="text-sm text-slate-600">
                        {item.cantidad} × {formatCurrency(item.precio_unitario)}
                      </p>
                    </div>
                    <p className="font-medium text-slate-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pago */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Método de pago:</span>
                  <Badge variant="secondary" className="capitalize">
                    {paymentData.tipoPago}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(cartItems.reduce((sum, item) => sum + item.subtotal, 0))}
                  </span>
                </div>

                {paymentData.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Descuento:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(paymentData.descuento)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
                  <span>Total Pagado:</span>
                  <span className="text-green-600">{formatCurrency(total)}</span>
                </div>

                {paymentData.observaciones && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Observaciones:</p>
                    <p className="text-sm text-slate-900">{paymentData.observaciones}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Print className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </div>

          <Button onClick={onFinish} className="w-full bg-slate-800 hover:bg-slate-700" size="lg">
            <Receipt className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SaleConfirmation
