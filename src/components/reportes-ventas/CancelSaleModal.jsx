"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X, Receipt } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

export default function CancelSaleModal({ isOpen, onClose, sale, onCancel }) {
  const [motivo, setMotivo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !sale) return null

  const handleConfirmCancel = async () => {
    if (!motivo.trim()) {
      setError("El motivo de anulación es obligatorio.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await onCancel(sale.id, motivo)
      if (result.success) {
        onClose() // Cerrar el modal al éxito
        setMotivo("") // Limpiar el motivo
      } else {
        setError(result.message || "Error al anular la venta.")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al anular la venta.")
      console.error("Error en handleConfirmCancel:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-600" />
            Confirmar Anulación de Venta
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Estás a punto de anular la venta <span className="font-semibold text-slate-800">{sale.numero_factura}</span>{" "}
            por un total de <span className="font-bold text-green-600">{formatCurrency(sale.total)}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Esta acción revertirá el stock de los productos y, si aplica, ajustará la cuenta corriente del cliente. Esta
            acción no se puede deshacer.
          </p>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de anulación</Label>
            <Textarea
              id="motivo"
              placeholder="Ej: Error en el registro, devolución completa, etc."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleConfirmCancel} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
