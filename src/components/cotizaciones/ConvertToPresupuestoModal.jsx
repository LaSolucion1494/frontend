"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, X, ArrowRight, CheckCircle } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

export default function ConvertToPresupuestoModal({ isOpen, onClose, cotizacion, onConvert }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !cotizacion) return null

  const handleConfirmConvert = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await onConvert(cotizacion.id)
      if (result.success) {
        onClose()
      } else {
        setError(result.message || "Error al convertir la cotización.")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al convertir la cotización.")
      console.error("Error en handleConfirmConvert:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-green-600" />
            Convertir a Presupuesto
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 mb-2">Convertir cotización aceptada a presupuesto</p>
                <div className="space-y-1 text-sm text-green-700">
                  <p>
                    <span className="font-medium">Cotización:</span> {cotizacion.numero_cotizacion}
                  </p>
                  <p>
                    <span className="font-medium">Cliente:</span> {cotizacion.cliente_nombre}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> {formatCurrency(cotizacion.total)}
                  </p>
                  <p>
                    <span className="font-medium">Productos:</span> {cotizacion.detalles?.length || 0} items
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">ℹ️ Información:</span> Se creará un nuevo presupuesto con:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
              <li>• Todos los productos de la cotización</li>
              <li>• Los mismos precios y descuentos</li>
              <li>• Referencia a la cotización original</li>
              <li>• Estado "activo" para poder procesar la venta</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">⚠️ Importante:</span> El presupuesto generado SÍ afectará el stock cuando se
              procese como venta, a diferencia de las cotizaciones.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleConfirmConvert} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            <ArrowRight className="h-4 w-4 mr-2" />
            {isSubmitting ? "Convirtiendo..." : "Convertir a Presupuesto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
