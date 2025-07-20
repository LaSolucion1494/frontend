"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

export default function UpdateCotizacionStatusModal({ isOpen, onClose, cotizacion, onUpdateStatus }) {
  const [nuevoEstado, setNuevoEstado] = useState("")
  const [motivo, setMotivo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !cotizacion) return null

  const estadosDisponibles = [
    { value: "activa", label: "Activa", icon: CheckCircle, color: "text-blue-600" },
    { value: "aceptada", label: "Aceptada", icon: CheckCircle, color: "text-green-600" },
    { value: "rechazada", label: "Rechazada", icon: XCircle, color: "text-red-600" },
    { value: "vencida", label: "Vencida", icon: Clock, color: "text-orange-600" },
  ].filter((estado) => estado.value !== cotizacion.estado)

  const handleConfirmUpdate = async () => {
    if (!nuevoEstado) {
      setError("Debe seleccionar un nuevo estado.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await onUpdateStatus(cotizacion.id, nuevoEstado, motivo)
      if (result.success) {
        onClose()
        setNuevoEstado("")
        setMotivo("")
      } else {
        setError(result.message || "Error al actualizar el estado.")
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al actualizar el estado.")
      console.error("Error en handleConfirmUpdate:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setNuevoEstado("")
    setMotivo("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Cambiar Estado de Cotización
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Cotización:</span> {cotizacion.numero_cotizacion}
            </p>
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Cliente:</span> {cotizacion.cliente_nombre}
            </p>
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Total:</span> {formatCurrency(cotizacion.total)}
            </p>
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Estado actual:</span>
              <span className="ml-1 capitalize font-medium">{cotizacion.estado}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nuevoEstado">Nuevo estado</Label>
            <select
              id="nuevoEstado"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="w-full h-10 px-3 border border-input rounded-md text-sm focus:border-ring focus:ring-ring/20"
              disabled={isSubmitting}
            >
              <option value="">Seleccionar nuevo estado...</option>
              {estadosDisponibles.map((estado) => {
                const IconComponent = estado.icon
                return (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del cambio (opcional)</Label>
            <Textarea
              id="motivo"
              placeholder="Ej: Cliente confirmó la cotización, se venció el plazo, etc."
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

          {nuevoEstado && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Nuevo estado:</span>
                <span className="ml-1 capitalize">
                  {estadosDisponibles.find((e) => e.value === nuevoEstado)?.label}
                </span>
              </p>
              {nuevoEstado === "aceptada" && (
                <p className="text-xs text-blue-600 mt-1">
                  ℹ️ Una vez aceptada, podrá convertir esta cotización a presupuesto
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmUpdate}
            disabled={isSubmitting || !nuevoEstado}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Actualizando..." : "Confirmar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
