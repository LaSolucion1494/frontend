"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X, Ban } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

export default function CancelCotizacionModal({ isOpen, onClose, cotizacion, onCancel }) {
  const [motivo, setMotivo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !cotizacion) return null

  const handleConfirmCancel = async () => {
    if (!motivo.trim()) {
      setError("El motivo de anulación es obligatorio.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await onCancel(cotizacion.id, motivo)
      if (result.success) {
        onClose()
        setMotivo("")
      } else {
        setError(result.message || "Error al anular la cotización.")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al anular la cotización.")
      console.error("Error en handleConfirmCancel:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setMotivo("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Confirmar Anulación de Cotización
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">Está a punto de anular la cotización</p>
                <div className="space-y-1 text-sm text-red-700">
                  <p>
                    <span className="font-medium">Número:</span> {cotizacion.numero_cotizacion}
                  </p>
                  <p>
                    <span className="font-medium">Cliente:</span> {cotizacion.cliente_nombre}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> {formatCurrency(cotizacion.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">⚠️ Importante:</span> Esta acción no se puede deshacer. La cotización quedará
              marcada como anulada permanentemente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de anulación *</Label>
            <Textarea
              id="motivo"
              placeholder="Ej: Error en los datos, cliente canceló, cotización duplicada, etc."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
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
          <Button
            onClick={handleConfirmCancel}
            disabled={isSubmitting || !motivo.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
